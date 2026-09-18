import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Gasto = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
};

export default function InicioScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'gastos'), orderBy('criadoEm', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        valor: doc.data().valor,
        descricao: doc.data().descricao,
        categoria: doc.data().categoria,
      }));
      setGastos(lista);
    });

    return () => unsubscribe();
  }, []);

  const saldoAtual = gastos.reduce((total, gasto) => total - gasto.valor, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Saldo atual</Text>
        <Text style={styles.saldo}>R$ {saldoAtual.toFixed(2)}</Text>
      </View>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum gasto lançado ainda</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemDescricao}>
                {item.descricao || 'Sem descrição'}
              </Text>
              <Text style={styles.itemCategoria}>{item.categoria}</Text>
            </View>
            <Text style={styles.itemValor}>R$ {item.valor.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 16, color: '#666' },
  saldo: { fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  lista: { padding: 20 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDescricao: { fontSize: 16 },
  itemCategoria: { fontSize: 13, color: '#999', marginTop: 2 },
  itemValor: { fontSize: 16, fontWeight: 'bold', color: '#dc2626' },
});