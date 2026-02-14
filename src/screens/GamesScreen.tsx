import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useGames} from '../hooks/useGames';
import {styles} from './GamesScreen.styles';

export default function GamesScreen() {
  const {
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
  } = useGames();

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
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
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