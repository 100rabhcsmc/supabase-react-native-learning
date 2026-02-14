import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
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