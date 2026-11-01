import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { login } from '../servicos/api';

export default function Login({ onLogin, onGoToCadastro, mensagemSessao }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }
    setErro('');
    setCarregando(true);
    
    try {
      const res = await login(usuario, senha);
      if (res.sucesso) {
        onLogin(res.dados, res.dados.token);
      } else {
        setErro(res.mensagem || 'Credenciais inválidas.');
      }
    } catch (err) {
      setErro(err.message || 'Erro na requisição.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo</Text>
      
      {mensagemSessao ? <Text style={styles.mensagemSessao}>{mensagemSessao}</Text> : null}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin} disabled={carregando}>
        <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLink} onPress={onGoToCadastro}>
        <Text style={styles.linkTexto}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  mensagemSessao: { color: '#e67e22', marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  erro: { color: 'red', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  botao: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoLink: { marginTop: 20, alignItems: 'center' },
  linkTexto: { color: '#3498db', fontSize: 16 }
});