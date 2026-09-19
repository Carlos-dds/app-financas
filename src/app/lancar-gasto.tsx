import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iconesCategorias } from '../constants/categorias';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

export default function LancarGastoScreen() {
  const c = useCores();
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
        userId: auth.currentUser?.uid,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <Text style={[styles.label, { color: c.textoSecundario }]}>Valor</Text>
      <TextInput
        style={[styles.input, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
        placeholder="0,00"
        placeholderTextColor={c.textoSecundario}
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <Text style={[styles.label, { color: c.textoSecundario }]}>Descrição</Text>
      <TextInput
        style={[styles.input, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
        placeholder="Ex: Mercado, Uber..."
        placeholderTextColor={c.textoSecundario}
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={[styles.label, { color: c.textoSecundario }]}>Categoria</Text>
      <View style={styles.categorias}>
        {categorias.map((cat) => {
            const selecionada = categoria === cat;
            return (
                <TouchableOpacity
                key={cat}
                style={[
                    styles.categoriaBotao,
                    {
                    borderColor: selecionada ? c.primaria : c.borda,
                    backgroundColor: selecionada ? c.primaria : 'transparent',
                    },
                ]}
                onPress={() => setCategoria(cat)}
                >
                <Ionicons
                    name={iconesCategorias[cat] as any}
                    size={16}
                    color={selecionada ? '#fff' : c.texto}
                    style={{ marginRight: 6 }}
                />
                <Text style={{ color: selecionada ? '#fff' : c.texto, fontWeight: selecionada ? 'bold' : 'normal' }}>
                    {cat}
                </Text>
                </TouchableOpacity>
            );
            })}
      </View>

      <TouchableOpacity
        style={[styles.botaoSalvar, { backgroundColor: c.primaria }]}
        onPress={salvarGasto}
        disabled={salvando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando...' : 'Salvar Gasto'}
        </Text>
      </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 categoriaBotao: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    },
  botaoSalvar: { borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});