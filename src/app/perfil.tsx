import { View, Text, StyleSheet } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.nome}>Não conectado</Text>
      <Text style={styles.aviso}>Login ainda não configurado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aviso: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});