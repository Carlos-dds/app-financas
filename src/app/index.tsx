import { View, Text, StyleSheet } from 'react-native';

export default function InicioScreen() {
  const saldoAtual = 0; // depois isso vai vir do Firebase

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saldo atual</Text>
      <Text style={styles.saldo}>R$ {saldoAtual.toFixed(2)}</Text>
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
  saldo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 8,
  },
});