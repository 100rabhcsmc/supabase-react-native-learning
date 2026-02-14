import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {supabase} from '../lib/supabase/supabase';

type Game = {
  id: number;
  title: string;
  image_url: string | null;
};

export default function GamesScreen() {
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
          // Any INSERT, UPDATE, or DELETE → refresh the list
          fetchGames();
        },
      )
      .subscribe();

    // Cleanup — unsubscribe when leaving the screen
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

  // INSERT — now includes user_id so RLS knows who owns this game
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

  // UPLOAD IMAGE — pick from gallery, upload to Storage, save URL to game row
  const uploadImage = async (gameId: number) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.uri || !asset.fileName) return;

    // Show loader for this game
    setUploadingId(gameId);

    try {
      const fileName = `${gameId}-${Date.now()}.jpg`;

      // Read the file and upload to Supabase Storage
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase upload
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

      // Get the public URL
      const {data: urlData} = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      // Save the URL to the games table
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

  const startEditing = (game: Game) => {
    setEditingId(game.id);
    setTitle(game.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Game title..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity
          style={[styles.button, editingId ? styles.updateButton : styles.addButton]}
          onPress={editingId ? updateGame : insertGame}>
          <Text style={styles.buttonText}>{editingId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
            <Text style={styles.buttonText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={games}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={styles.row}>
            {/* Game image */}
            {item.image_url ? (
              <Image source={{uri: item.image_url}} style={styles.gameImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No img</Text>
              </View>
            )}

            {/* Game title — tap to edit */}
            <TouchableOpacity style={styles.rowContent} onPress={() => startEditing(item)}>
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>

            {/* Upload image button */}
            {uploadingId === item.id ? (
              <ActivityIndicator size="small" color="#4ecdc4" />
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => uploadImage(item.id)}>
                <Text style={styles.uploadText}>Photo</Text>
              </TouchableOpacity>
            )}

            {/* Delete button */}
            <TouchableOpacity onPress={() => deleteGame(item.id, item.title)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No games found</Text>}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    padding: 20,
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
  },
  updateButton: {
    backgroundColor: '#f0a500',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  gameImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2a2a5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#666',
  },
  rowContent: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f0f23',
  },
  deleteText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});