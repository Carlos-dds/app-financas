import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  collection, query, where, orderBy, onSnapshot, deleteDoc, updateDoc, doc, setDoc,
  getDocs, limit, Timestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';
import { coresCategorias } from '../constants/cores';
import { iconesCategorias } from '../constants/categorias';

type Gasto = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  criadoEm: Timestamp;
};

type Aporte = { id: string; valor: number; criadoEm: Timestamp };

export default function InicioScreen() {
  const c = useCores();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [receita, setReceita] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState(new Date());

  const mesAno = `${mesSelecionado.getFullYear()}-${String(mesSelecionado.getMonth() + 1).padStart(2, '0')}`;
  const receitaId = `${auth.currentUser?.uid}_${mesAno}`;

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
        criadoEm: doc.data().criadoEm,
      })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'aportes'),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAportes(snapshot.docs.map((doc) => ({
        id: doc.id,
        valor: doc.data().valor,
        criadoEm: doc.data().criadoEm,
      })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'receitas', receitaId), (snap) => {
      setReceita(snap.exists() ? snap.data().valor : 0);
    });
    return () => unsubscribe();
  }, [receitaId]);

  const gastosDoMes = gastos.filter((gasto) => {
    const data = gasto.criadoEm?.toDate();
    return data && data.getMonth() === mesSelecionado.getMonth() && data.getFullYear() === mesSelecionado.getFullYear();
  });

  const aportesDoMes = aportes.filter((aporte) => {
    const data = aporte.criadoEm?.toDate();
    return data && data.getMonth() === mesSelecionado.getMonth() && data.getFullYear() === mesSelecionado.getFullYear();
  });

  const totalGastoMes = gastosDoMes.reduce((total, g) => total + g.valor, 0);
  const totalGuardadoMes = aportesDoMes.reduce((total, a) => total + a.valor, 0);
  const sobra = receita - totalGastoMes - totalGuardadoMes;

  const percentGasto = receita > 0 ? Math.min((totalGastoMes / receita) * 100, 100) : 0;
  const percentGuardado = receita > 0 ? Math.min((totalGuardadoMes / receita) * 100, 100) : 0;
  const percentSobra = receita > 0 ? Math.max(100 - percentGasto - percentGuardado, 0) : 0;

  const totaisPorCategoria: Record<string, number> = {};
  gastosDoMes.forEach((gasto) => {
    totaisPorCategoria[gasto.categoria] = (totaisPorCategoria[gasto.categoria] || 0) + gasto.valor;
  });
  const categoriasOrdenadas = Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]);
  const maiorValor = categoriasOrdenadas.length > 0 ? categoriasOrdenadas[0][1] : 0;

  function mudarMes(direcao: 1 | -1) {
    const novaData = new Date(mesSelecionado);
    novaData.setMonth(novaData.getMonth() + direcao);
    setMesSelecionado(novaData);
  }

  const nomeMes = mesSelecionado
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (letra) => letra.toUpperCase());

  function editarReceita() {
    Alert.prompt(
      'Renda do mês',
      `Quanto você recebeu em ${nomeMes}?`,
      async (valorDigitado) => {
        const valor = parseFloat((valorDigitado || '').replace(',', '.'));
        if (!valor || valor < 0) return;
        try {
          await setDoc(
            doc(db, 'receitas', receitaId),
            { valor, mesAno, userId: auth.currentUser?.uid, atualizadoEm: Timestamp.now() },
            { merge: true }
          );
        } catch (erro) {
          console.error(erro);
          Alert.alert('Erro', 'Não foi possível salvar a renda.');
        }
      },
      'plain-text',
      receita > 0 ? String(receita) : '',
      'numeric'
    );
  }

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
        data={gastosDoMes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            <View style={styles.seletorMes}>
              <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.setaMes}>
                <Ionicons name="chevron-back" size={22} color={c.texto} />
              </TouchableOpacity>
              <Text style={[styles.nomeMes, { color: c.texto }]}>{nomeMes}</Text>
              <TouchableOpacity onPress={() => mudarMes(1)} style={styles.setaMes}>
                <Ionicons name="chevron-forward" size={22} color={c.texto} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cardReceita} onPress={editarReceita}>
              <Text style={[styles.label, { color: c.textoSecundario }]}>
                {receita > 0 ? 'Ainda disponível' : 'Renda do mês'}
              </Text>
              <Text style={[styles.saldo, { color: sobra < 0 ? c.perigo : c.primaria }]}>
                R$ {(receita > 0 ? sobra : receita).toFixed(2)}
              </Text>
              {receita > 0 && (
                <Text style={[styles.subtitulo, { color: c.textoSecundario }]}>
                  Renda recebida: R$ {receita.toFixed(2)}
                </Text>
              )}
              <Text style={[styles.dica, { color: c.textoSecundario }]}>
                {receita > 0 ? 'Toque para editar a renda' : 'Toque para cadastrar'}
              </Text>
            </TouchableOpacity>

            {receita > 0 && (
              <View style={styles.resumoPercentual}>
                <View style={[styles.barraEmpilhada, { backgroundColor: c.fundoSecundario }]}>
                  <View style={{ width: `${percentGasto}%`, backgroundColor: c.perigo }} />
                  <View style={{ width: `${percentGuardado}%`, backgroundColor: c.primaria }} />
                  <View style={{ width: `${percentSobra}%`, backgroundColor: '#9CA3AF' }} />
                </View>

                <View style={styles.legendas}>
                  <View style={styles.legendaItem}>
                    <View style={[styles.legendaBolinha, { backgroundColor: c.perigo }]} />
                    <Text style={[styles.legendaTexto, { color: c.texto }]}>
                      Gastos {percentGasto.toFixed(0)}% (R$ {totalGastoMes.toFixed(2)})
                    </Text>
                  </View>
                  <View style={styles.legendaItem}>
                    <View style={[styles.legendaBolinha, { backgroundColor: c.primaria }]} />
                    <Text style={[styles.legendaTexto, { color: c.texto }]}>
                      Guardado {percentGuardado.toFixed(0)}% (R$ {totalGuardadoMes.toFixed(2)})
                    </Text>
                  </View>
                  <View style={styles.legendaItem}>
                    <View style={[styles.legendaBolinha, { backgroundColor: '#9CA3AF' }]} />
                    <Text style={[styles.legendaTexto, { color: c.texto }]}>
                      Sobrou {percentSobra.toFixed(0)}% (R$ {sobra.toFixed(2)})
                    </Text>
                  </View>
                </View>

                {sobra < 0 && (
                  <Text style={[styles.alertaEstouro, { color: c.perigo }]}>
                    Você gastou/guardou mais do que recebeu esse mês
                  </Text>
                )}
              </View>
            )}

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
            Nenhum gasto nesse mês
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
          gastosDoMes.length > 0 ? (
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
  seletorMes: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 16, gap: 16,
  },
  setaMes: { padding: 8 },
  nomeMes: { fontSize: 16, fontWeight: 'bold', minWidth: 160, textAlign: 'center' },
  cardReceita: { alignItems: 'center', paddingVertical: 16 },
  label: { fontSize: 14 },
  saldo: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  subtitulo: { fontSize: 13, marginTop: 2 },
  dica: { fontSize: 12, marginTop: 4 },
  resumoPercentual: { paddingHorizontal: 20, paddingVertical: 12 },
  barraEmpilhada: {
    flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 12,
  },
  legendas: { gap: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendaBolinha: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 13 },
  alertaEstouro: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: 'bold' },
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
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  itemDescricao: { fontSize: 16 },
  itemCategoria: { fontSize: 13, marginTop: 2 },
  itemValor: { fontSize: 16, fontWeight: 'bold' },
  dicaGeral: { textAlign: 'center', fontSize: 12, paddingTop: 16 },
});