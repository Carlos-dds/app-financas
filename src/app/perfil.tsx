import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function PerfilScreen() {
  const usuario = auth.currentUser;

  function sair() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.nome}>{usuario?.email}</Text>
      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  nome: { fontSize: 18, fontWeight: 'bold', marginBottom: 24 },
  botaoSair: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  botaoSairTexto: { color: '#dc2626', fontWeight: 'bold' },
});