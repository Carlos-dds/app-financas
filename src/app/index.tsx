import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  collection, query, where, orderBy, onSnapshot, deleteDoc, updateDoc, doc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';
import { coresCategorias } from '../constants/cores';
import { Ionicons } from '@expo/vector-icons';
import { iconesCategorias } from '../constants/categorias';

type Gasto = { id: string; valor: number; descricao: string; categoria: string };

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
      setGastos(snapshot.docs.map((doc) => ({
        id: doc.id,
        valor: doc.data().valor,
        descricao: doc.data().descricao,
        categoria: doc.data().categoria,
      })));
    });
    return () => unsubscribe();
  }, []);

  const saldoAtual = gastos.reduce((total, gasto) => total - gasto.valor, 0);

  // Agrupa o total gasto por categoria
  const totaisPorCategoria: Record<string, number> = {};
  gastos.forEach((gasto) => {
    totaisPorCategoria[gasto.categoria] = (totaisPorCategoria[gasto.categoria] || 0) + gasto.valor;
  });

  const categoriasOrdenadas = Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]);
  const maiorValor = categoriasOrdenadas.length > 0 ? categoriasOrdenadas[0][1] : 0;

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
      'plain-text', String(gasto.valor), 'numeric'
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
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { borderBottomColor: c.borda }]}>
              <Text style={[styles.label, { color: c.textoSecundario }]}>Saldo atual</Text>
              <Text style={[styles.saldo, { color: c.primaria }]}>
                R$ {saldoAtual.toFixed(2)}
              </Text>
            </View>

            {categoriasOrdenadas.length > 0 && (
              <View style={styles.grafico}>
                <Text style={[styles.tituloGrafico, { color: c.texto }]}>
                  Gastos por categoria
                </Text>
                {categoriasOrdenadas.map(([categoria, total]) => (
                  <View key={categoria} style={styles.linhaGrafico}>
                    <View style={styles.linhaGraficoHeader}>
                      <Text style={[styles.categoriaGrafico, { color: c.texto }]}>
                        {categoria}
                      </Text>
                      <Text style={[styles.valorGrafico, { color: c.textoSecundario }]}>
                        R$ {total.toFixed(2)}
                      </Text>
                    </View>
                    <View style={[styles.barraFundoGrafico, { backgroundColor: c.fundoSecundario }]}>
                      <View
                        style={[
                          styles.barraGrafico,
                          {
                            width: `${(total / maiorValor) * 100}%`,
                            backgroundColor: coresCategorias[categoria] || c.primaria,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.tituloLista, { color: c.texto }]}>Histórico</Text>
          </>
        }
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
    <View style={styles.itemEsquerda}>
      <View style={[styles.iconeCirculo, { backgroundColor: coresCategorias[item.categoria] || c.primaria }]}>
        <Ionicons name={iconesCategorias[item.categoria] as any} size={18} color="#fff" />
      </View>
      <View>
        <Text style={[styles.itemDescricao, { color: c.texto }]}>
          {item.descricao || 'Sem descrição'}
        </Text>
        <Text style={[styles.itemCategoria, { color: c.textoSecundario }]}>
          {item.categoria}
        </Text>
      </View>
    </View>
    <Text style={[styles.itemValor, { color: c.perigo }]}>
      R$ {item.valor.toFixed(2)}
    </Text>
  </TouchableOpacity>
)}
        ListFooterComponent={
          gastos.length > 0 ? (
            <Text style={[styles.dicaGeral, { color: c.textoSecundario }]}>
              Toque num gasto para editar · Segure para apagar
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  saldo: { fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  lista: { paddingBottom: 20 },
  grafico: { padding: 20 },
  tituloGrafico: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  linhaGrafico: { marginBottom: 12 },
  linhaGraficoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoriaGrafico: { fontSize: 14 },
  valorGrafico: { fontSize: 13 },
  barraFundoGrafico: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barraGrafico: { height: 10, borderRadius: 5 },
  tituloLista: { fontSize: 16, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 8 },
  vazio: { textAlign: 'center', marginTop: 40 },
  item: {
  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1,
},
itemEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 12 },
iconeCirculo: {
  width: 36, height: 36, borderRadius: 18,
  alignItems: 'center', justifyContent: 'center',
},
  itemDescricao: { fontSize: 16 },
  itemCategoria: { fontSize: 13, marginTop: 2 },
  itemValor: { fontSize: 16, fontWeight: 'bold' },
  dicaGeral: { textAlign: 'center', fontSize: 12, paddingTop: 16 },
});