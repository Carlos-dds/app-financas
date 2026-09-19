import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

type Meta = {
  id: string;
  nome: string;
  valorAtual: number;
  valorMeta: number;
};

export default function GuardadoScreen() {
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
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        valorAtual: doc.data().valorAtual,
        valorMeta: doc.data().valorMeta,
      }));
      setMetas(lista);
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
          await updateDoc(doc(db, 'metas', meta.id), {
            valorAtual: increment(valor),
          });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Total guardado</Text>
        <Text style={styles.totalValor}>R$ {totalGuardado.toFixed(2)}</Text>
      </View>

      <View style={styles.formNovaMeta}>
        <TextInput
          style={styles.inputPequeno}
          placeholder="Nome da meta (ex: Viagem)"
          value={nomeNovaMeta}
          onChangeText={setNomeNovaMeta}
        />
        <TextInput
          style={styles.inputPequeno}
          placeholder="Valor objetivo"
          keyboardType="numeric"
          value={valorNovaMeta}
          onChangeText={setValorNovaMeta}
        />
        <TouchableOpacity
          style={styles.botaoCriar}
          onPress={criarMeta}
          disabled={salvando}
        >
          <Text style={styles.botaoCriarTexto}>
            {salvando ? 'Criando...' : '+ Criar meta'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={metas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma meta cadastrada ainda</Text>
        }
        renderItem={({ item }) => {
          const progresso = Math.min(item.valorAtual / item.valorMeta, 1);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => guardarDinheiro(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardNome}>{item.nome}</Text>
                <Text style={styles.cardValores}>
                  R$ {item.valorAtual.toFixed(2)} / R$ {item.valorMeta.toFixed(2)}
                </Text>
              </View>
              <View style={styles.barraFundo}>
                <View
                  style={[styles.barraProgresso, { width: `${progresso * 100}%` }]}
                />
              </View>
              <Text style={styles.dica}>Toque para guardar dinheiro</Text>
            </TouchableOpacity>
          );
        }}
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
  totalValor: { fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  formNovaMeta: { padding: 20, gap: 8 },
  inputPequeno: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  botaoCriar: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  botaoCriarTexto: { color: '#fff', fontWeight: 'bold' },
  lista: { paddingHorizontal: 20, paddingBottom: 20 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardNome: { fontSize: 16, fontWeight: 'bold' },
  cardValores: { fontSize: 13, color: '#666' },
  barraFundo: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: 8,
    backgroundColor: '#16a34a',
  },
  dica: { fontSize: 12, color: '#999', marginTop: 6, textAlign: 'center' },
});