import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

export default function LoginScreen() {
  const c = useCores();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert('Ops', 'Preencha email e senha.');
      return;
    }
    setCarregando(true);
    try {
      if (modoCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha);
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
      }
    } catch (erro: any) {
      Alert.alert('Erro', traduzirErro(erro.code));
    } finally {
      setCarregando(false);
    }
  }

  function traduzirErro(codigo: string) {
    switch (codigo) {
      case 'auth/invalid-email': return 'Email inválido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email ou senha incorretos.';
      case 'auth/email-already-in-use': return 'Esse email já está cadastrado.';
      case 'auth/weak-password': return 'A senha precisa ter pelo menos 6 caracteres.';
      default: return 'Algo deu errado. Tente novamente.';
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <Text style={[styles.titulo, { color: c.texto }]}>
        {modoCadastro ? 'Criar conta' : 'Entrar'}
      </Text>

      <TextInput
        style={[styles.input, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
        placeholder="Email"
        placeholderTextColor={c.textoSecundario}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
        placeholder="Senha"
        placeholderTextColor={c.textoSecundario}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: c.primaria }]}
        onPress={entrar}
        disabled={carregando}
      >
        <Text style={styles.botaoTexto}>
          {carregando ? 'Aguarde...' : modoCadastro ? 'Cadastrar' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModoCadastro(!modoCadastro)}>
        <Text style={[styles.link, { color: c.primaria }]}>
          {modoCadastro ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  botao: { borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16 },
});