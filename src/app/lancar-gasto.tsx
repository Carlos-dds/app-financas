import { View, Text, StyleSheet } from 'react-native';

export default function LancarGastoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lançar Gasto</Text>
      <Text style={styles.aviso}>Formulário em construção</Text>
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
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aviso: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});