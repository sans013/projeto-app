import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { editarUsuario, excluirUsuario } from '../servicos/api';

export default function EditarUsuario({ usuario, onGoBack, onSessionExpired }) {
  const [form, setForm] = useState({
    nome: usuario.nome || '',
    sobrenome: usuario.sobrenome || '',
    email: usuario.email || '',
    usuario: usuario.usuario || ''
  });
  const [erro, setErro] = useState('');

  const atualizarForm = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleSalvar = async () => {
    try {
      const res = await editarUsuario(usuario.id, form);
      if (res.sucesso) {
        alert('Usuário atualizado com sucesso!');
        onGoBack();
      } else {
        setErro(res.mensagem || 'Erro ao atualizar.');
      }
    } catch (err) {
      if (err.message === '401_UNAUTHORIZED') onSessionExpired();
      else setErro(err.message);
    }
  };

  const handleExcluir = async () => {
    const executarExclusao = async () => {
      try {
        const res = await excluirUsuario(usuario.id);
        if (res.sucesso) {
          alert('Usuário excluído.');
          onGoBack();
        } else {
          setErro(res.mensagem);
        }
      } catch (err) {
        if (err.message === '401_UNAUTHORIZED') onSessionExpired();
        else setErro(err.message);
      }
    };

    // A função Window.confirm é mais segura para web caso o Alert nativo seja bloqueado no navegador.
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        executarExclusao();
      }
    } else {
      Alert.alert('Atenção', 'Tem certeza que deseja excluir este usuário?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: executarExclusao }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.botaoVoltar}>{"< Voltar"}</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Usuário</Text>
      </View>

      <View style={styles.formulario}>
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={form.nome} onChangeText={v => atualizarForm('nome', v)} />

        <Text style={styles.label}>Sobrenome</Text>
        <TextInput style={styles.input} value={form.sobrenome} onChangeText={v => atualizarForm('sobrenome', v)} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={v => atualizarForm('email', v)} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Usuário</Text>
        <TextInput style={styles.input} value={form.usuario} onChangeText={v => atualizarForm('usuario', v)} autoCapitalize="none" />

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.textoBotao}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluir}>
          <Text style={styles.textoBotaoExcluir}>Excluir Usuário</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  botaoVoltar: { fontSize: 16, color: '#3498db', marginRight: 15 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  formulario: { padding: 20 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  erro: { color: 'red', marginBottom: 15, textAlign: 'center' },
  botaoSalvar: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoExcluir: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#e74c3c' },
  textoBotaoExcluir: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold' }
});