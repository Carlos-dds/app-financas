import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

export default function PerfilScreen() {
  const c = useCores();
  const usuario = auth.currentUser;

  function sair() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <Text style={[styles.nome, { color: c.texto }]}>{usuario?.email}</Text>
      <TouchableOpacity style={[styles.botaoSair, { borderColor: c.perigo }]} onPress={sair}>
        <Text style={[styles.botaoSairTexto, { color: c.perigo }]}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  nome: { fontSize: 18, fontWeight: 'bold', marginBottom: 24 },
  botaoSair: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  botaoSairTexto: { fontWeight: 'bold' },
});