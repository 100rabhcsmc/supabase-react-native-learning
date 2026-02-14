import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {supabase} from '../lib/supabase/supabase';

export type Game = {
  id: number;
  title: string;
  image_url: string | null;
};

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchGames();

    // REALTIME — subscribe to changes on the games table
    const channel = supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'games'},
        () => {
          fetchGames();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // READ
  const fetchGames = async () => {
    const {data, error} = await supabase.from('games').select('*');
    if (error) {
      console.log('Error:', error);
    } else {
      setGames(data);
    }
    setLoading(false);
  };

  // INSERT
  const insertGame = async () => {
    if (!title.trim()) return;

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return;

    const {error} = await supabase
      .from('games')
      .insert({title: title.trim(), user_id: user.id});

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTitle('');
      fetchGames();
    }
  };

  // UPDATE
  const updateGame = async () => {
    if (!title.trim() || !editingId) return;

    const {error} = await supabase
      .from('games')
      .update({title: title.trim()})
      .eq('id', editingId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTitle('');
      setEditingId(null);
      fetchGames();
    }
  };

  // DELETE
  const deleteGame = (id: number, gameTitle: string) => {
    Alert.alert('Delete', `Delete "${gameTitle}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const {error} = await supabase.from('games').delete().eq('id', id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            fetchGames();
          }
        },
      },
    ]);
  };

  // UPLOAD IMAGE
  const uploadImage = async (gameId: number) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.uri || !asset.fileName) return;

    setUploadingId(gameId);

    try {
      const fileName = `${gameId}-${Date.now()}.jpg`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const {error: uploadError} = await supabase.storage
        .from('game-images')
        .upload(fileName, arrayBuffer, {
          contentType: asset.type || 'image/jpeg',
        });

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
        return;
      }

      const {data: urlData} = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      const {error: updateError} = await supabase
        .from('games')
        .update({image_url: urlData.publicUrl})
        .eq('id', gameId);

      if (updateError) {
        Alert.alert('Error', updateError.message);
      } else {
        fetchGames();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setUploadingId(null);
    }
  };

  // EDITING HELPERS
  const startEditing = (game: Game) => {
    setEditingId(game.id);
    setTitle(game.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
  };

  // LOGOUT
  const logout = () => {
    supabase.auth.signOut();
  };

  return {
    games,
    loading,
    title,
    setTitle,
    editingId,
    uploadingId,
    insertGame,
    updateGame,
    deleteGame,
    uploadImage,
    startEditing,
    cancelEditing,
    logout,
  };
}