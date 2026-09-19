import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

type Gasto = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
};

export default function InicioScreen() {
  const c = useCores();
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'gastos'),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('criadoEm', 'desc')
    );

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

  function editarGasto(gasto: Gasto) {
    Alert.prompt(
      'Editar valor',
      `Novo valor para "${gasto.descricao || 'gasto'}"`,
      async (novoValor) => {
        const valor = parseFloat((novoValor || '').replace(',', '.'));
        if (!valor || valor <= 0) return;
        try {
          await updateDoc(doc(db, 'gastos', gasto.id), { valor });
        } catch (erro) {
          console.error(erro);
          Alert.alert('Erro', 'Não foi possível atualizar o gasto.');
        }
      },
      'plain-text',
      String(gasto.valor),
      'numeric'
    );
  }

  function apagarGasto(gasto: Gasto) {
    Alert.alert(
      'Apagar gasto',
      `Apagar "${gasto.descricao || 'gasto'}" de R$ ${gasto.valor.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'gastos', gasto.id));
            } catch (erro) {
              console.error(erro);
              Alert.alert('Erro', 'Não foi possível apagar o gasto.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <View style={[styles.header, { borderBottomColor: c.borda }]}>
        <Text style={[styles.label, { color: c.textoSecundario }]}>Saldo atual</Text>
        <Text style={[styles.saldo, { color: c.primaria }]}>
          R$ {saldoAtual.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={[styles.vazio, { color: c.textoSecundario }]}>
            Nenhum gasto lançado ainda
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: c.borda }]}
            onPress={() => editarGasto(item)}
            onLongPress={() => apagarGasto(item)}
          >
            <View>
              <Text style={[styles.itemDescricao, { color: c.texto }]}>
                {item.descricao || 'Sem descrição'}
              </Text>
              <Text style={[styles.itemCategoria, { color: c.textoSecundario }]}>
                {item.categoria}
              </Text>
            </View>
            <Text style={[styles.itemValor, { color: c.perigo }]}>
              R$ {item.valor.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={[styles.dicaGeral, { color: c.textoSecundario }]}>
        Toque num gasto para editar o valor · Segure para apagar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  saldo: { fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  lista: { padding: 20 },
  vazio: { textAlign: 'center', marginTop: 40 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemDescricao: { fontSize: 16 },
  itemCategoria: { fontSize: 13, marginTop: 2 },
  itemValor: { fontSize: 16, fontWeight: 'bold' },
  dicaGeral: { textAlign: 'center', fontSize: 12, paddingBottom: 16 },
});