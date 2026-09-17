import { View, Text, StyleSheet } from 'react-native';

export default function GuardadoScreen() {
  const totalGuardado = 0; // depois vem do Firebase

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total guardado</Text>
      <Text style={styles.valor}>R$ {totalGuardado.toFixed(2)}</Text>
      <Text style={styles.aviso}>Nenhuma meta cadastrada ainda</Text>
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
  label: {
    fontSize: 16,
    color: '#666',
  },
  valor: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 8,
  },
  aviso: {
    fontSize: 14,
    color: '#999',
    marginTop: 24,
  },
});