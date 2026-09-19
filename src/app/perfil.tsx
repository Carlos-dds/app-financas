import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebaseConfig';
import { useCores } from '../hooks/useCores';

export default function PerfilScreen() {
  const c = useCores();
  const usuario = auth.currentUser;

  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    const unsubscribe = onSnapshot(doc(db, 'usuarios', usuario.uid), (snap) => {
      if (snap.exists()) {
        setNome(snap.data().nome || '');
        setFoto(snap.data().fotoBase64 || null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets[0].base64) {
      const dataUri = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setFoto(dataUri);
    }
  }

  async function salvarPerfil() {
    if (!usuario) return;
    setSalvando(true);
    try {
      await setDoc(
        doc(db, 'usuarios', usuario.uid),
        { nome, fotoBase64: foto },
        { merge: true }
      );
      setEditando(false);
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  function sair() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.fundo }]}>
      <TouchableOpacity
        onPress={editando ? escolherFoto : undefined}
        style={[styles.avatarWrapper, { borderColor: c.primaria }]}
      >
        {foto ? (
          <Image source={{ uri: foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: c.fundoSecundario }]}>
            <Text style={{ fontSize: 32, color: c.textoSecundario }}>
              {(nome || usuario?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        {editando && (
          <View style={[styles.avatarEditarBadge, { backgroundColor: c.primaria }]}>
            <Text style={styles.avatarEditarTexto}>Editar</Text>
          </View>
        )}
      </TouchableOpacity>

      {editando ? (
        <TextInput
          style={[styles.input, { borderColor: c.borda, color: c.texto, backgroundColor: c.fundoSecundario }]}
          placeholder="Seu nome"
          placeholderTextColor={c.textoSecundario}
          value={nome}
          onChangeText={setNome}
        />
      ) : (
        <Text style={[styles.nome, { color: c.texto }]}>{nome || 'Sem nome cadastrado'}</Text>
      )}

      <Text style={[styles.email, { color: c.textoSecundario }]}>{usuario?.email}</Text>

      {editando ? (
        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: c.primaria }]}
          onPress={salvarPerfil}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>Salvar</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: c.primaria }]}
          onPress={() => setEditando(true)}
        >
          <Text style={styles.botaoPrimarioTexto}>Editar perfil</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.botaoSair, { borderColor: c.perigo }]} onPress={sair}>
        <Text style={[styles.botaoSairTexto, { color: c.perigo }]}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  avatarWrapper: { marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center',
  },
  avatarEditarBadge: {
    position: 'absolute', bottom: 0, alignSelf: 'center',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  avatarEditarTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  nome: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16,
    width: '100%', textAlign: 'center', marginTop: 4,
  },
  email: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  botaoPrimario: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 12 },
  botaoPrimarioTexto: { color: '#fff', fontWeight: 'bold' },
  botaoSair: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  botaoSairTexto: { fontWeight: 'bold' },
});