import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function LancarGastoScreen() {
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Alimentação');
  const [salvando, setSalvando] = useState(false);

  const categorias = ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Outros'];

  async function salvarGasto() {
    if (!valor) {
      Alert.alert('Ops', 'Informe um valor para o gasto.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'gastos'), {
        valor: parseFloat(valor.replace(',', '.')),
        descricao,
        categoria,
        criadoEm: Timestamp.now(),
      });

      Alert.alert('Salvo!', `Gasto de R$ ${valor} em ${categoria} registrado.`);
      setValor('');
      setDescricao('');
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro', 'Não foi possível salvar o gasto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Valor</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Mercado, Uber..."
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoriaBotao,
              categoria === cat && styles.categoriaSelecionada,
            ]}
            onPress={() => setCategoria(cat)}
          >
            <Text
              style={
                categoria === cat ? styles.categoriaTextoSelecionado : styles.categoriaTexto
              }
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={salvarGasto}
        disabled={salvando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando...' : 'Salvar Gasto'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#666', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoriaBotao: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoriaSelecionada: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoriaTexto: { color: '#333' },
  categoriaTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  botaoSalvar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});