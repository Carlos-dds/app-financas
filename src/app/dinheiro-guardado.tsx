import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, updateDoc, deleteDoc, increment, Timestamp, writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

type Meta = { id: string; nome: string; valorAtual: number; valorMeta: number };

function apagarMeta(meta: Meta) {
  Alert.alert(
    'Apagar meta',
    `Apagar a meta "${meta.nome}"? Isso não apaga o dinheiro guardado, só a meta.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'metas', meta.id));
          } catch (erro) {
            console.error(erro);
            Alert.alert('Erro', 'Não foi possível apagar a meta.');
          }
        },
      },
    ]
  );
}

export default function GuardadoScreen() {
  const c = useCores();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [nomeNovaMeta, setNomeNovaMeta] = useState('');
  const [valorNovaMeta, setValorNovaMeta] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'metas'),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMetas(snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        valorAtual: doc.data().valorAtual,
        valorMeta: doc.data().valorMeta,
      })));
    });
    return () => unsubscribe();
  }, []);

  const totalGuardado = metas.reduce((total, meta) => total + meta.valorAtual, 0);

  async function criarMeta() {
    if (!nomeNovaMeta || !valorNovaMeta) {
      Alert.alert('Ops', 'Preencha o nome e o valor da meta.');
      return;
    }
    setSalvando(true);
    try {
      await addDoc(collection(db, 'metas'), {
        nome: nomeNovaMeta,
        valorMeta: parseFloat(valorNovaMeta.replace(',', '.')),
        valorAtual: 0,
        userId: auth.currentUser?.uid,
        criadoEm: Timestamp.now(),
      });
      setNomeNovaMeta('');
      setValorNovaMeta('');
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro', 'Não foi possível criar a meta.');
    } finally {
      setSalvando(false);
    }
  }

  function guardarDinheiro(meta: Meta) {
  Alert.prompt(
    `Guardar em "${meta.nome}"`,
    'Quanto você quer adicionar?',
    async (valorDigitado) => {
      const valor = parseFloat((valorDigitado || '').replace(',', '.'));
      if (!valor || valor <= 0) return;

      try {
        const lote = writeBatch(db);

        lote.update(doc(db, 'metas', meta.id), {
          valorAtual: increment(valor),
        });

        const novoAporteRef = doc(collection(db, 'aportes'));
        lote.set(novoAporteRef, {
          valor,
          metaId: meta.id,
          metaNome: meta.nome,
          userId: auth.currentUser?.uid,
          criadoEm: Timestamp.now(),
        });

        await lote.commit();
      } catch (erro) {
        console.error(erro);
        Alert.alert('Erro', 'Não foi possível atualizar a meta.');
      }
    },
    'plain-text',
    '',
    'numeric'
  );
}

  return (
    <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <View style={[styles.header, { borderBottomColor: c.borda }]}>
        <Text style={[styles.label, { color: c.textoSecundario }]}>Total guardado</Text>
        <Text style={[styles.totalValor, { color: c.primaria }]}>
          R$ {totalGuardado.toFixed(2)}
        </Text>
      </View>

      <View style={styles.formNovaMeta}>
        <TextInput
          style={[styles.inputPequeno, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
          placeholder="Nome da meta (ex: Viagem)"
          placeholderTextColor={c.textoSecundario}
          value={nomeNovaMeta}
          onChangeText={setNomeNovaMeta}
        />
        <TextInput
          style={[styles.inputPequeno, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
          placeholder="Valor objetivo"
          placeholderTextColor={c.textoSecundario}
          keyboardType="numeric"
          value={valorNovaMeta}
          onChangeText={setValorNovaMeta}
        />
        <TouchableOpacity
          style={[styles.botaoCriar, { backgroundColor: c.primaria }]}
          onPress={criarMeta}
          disabled={salvando}
        >
          <Text style={styles.botaoCriarTexto}>{salvando ? 'Criando...' : '+ Criar meta'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={metas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={[styles.vazio, { color: c.textoSecundario }]}>Nenhuma meta cadastrada ainda</Text>
        }
        renderItem={({ item }) => {
          const progresso = Math.min(item.valorAtual / item.valorMeta, 1);
          return (
            <TouchableOpacity
              style={[styles.card, { borderColor: c.borda, backgroundColor: c.cardFundo }]}
              onPress={() => guardarDinheiro(item)}
              onLongPress={() => apagarMeta(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardNome, { color: c.texto }]}>{item.nome}</Text>
                <Text style={[styles.cardValores, { color: c.textoSecundario }]}>
                  R$ {item.valorAtual.toFixed(2)} / R$ {item.valorMeta.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.barraFundo, { backgroundColor: c.primariaClara }]}>
                <View style={[styles.barraProgresso, { width: `${progresso * 100}%`, backgroundColor: c.primaria }]} />
              </View>
              <Text style={[styles.dica, { color: c.textoSecundario }]}>Toque para guardar dinheiro</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  totalValor: { fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  formNovaMeta: { padding: 20, gap: 8 },
  inputPequeno: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15 },
  botaoCriar: { borderRadius: 8, padding: 12, alignItems: 'center' },
  botaoCriarTexto: { color: '#fff', fontWeight: 'bold' },
  lista: { paddingHorizontal: 20, paddingBottom: 20 },
  vazio: { textAlign: 'center', marginTop: 40 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardNome: { fontSize: 16, fontWeight: 'bold' },
  cardValores: { fontSize: 13 },
  barraFundo: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barraProgresso: { height: 8 },
  dica: { fontSize: 12, marginTop: 6, textAlign: 'center' },
});