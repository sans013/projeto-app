import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { cadastrar } from '../servicos/api';

export default function Cadastro({ onGoBack }) {
  const [form, setForm] = useState({ nome: '', sobrenome: '', email: '', usuario: '', senha: '' });
  const [erro, setErro] = useState('');

  const atualizarForm = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleCadastrar = async () => {
    setErro('');
    try {
      const res = await cadastrar(form);
      if (res.sucesso) {
        alert('Cadastro realizado com sucesso!');
        onGoBack();
      } else {
        setErro(res.mensagem || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      setErro(err.message || 'Falha na comunicação.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Novo Cadastro</Text>
      
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TextInput style={styles.input} placeholder="Nome" value={form.nome} onChangeText={v => atualizarForm('nome', v)} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={form.sobrenome} onChangeText={v => atualizarForm('sobrenome', v)} />
      <TextInput style={styles.input} placeholder="E-mail" value={form.email} onChangeText={v => atualizarForm('email', v)} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Usuário" value={form.usuario} onChangeText={v => atualizarForm('usuario', v)} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={form.senha} onChangeText={v => atualizarForm('senha', v)} secureTextEntry />

      <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLink} onPress={onGoBack}>
        <Text style={styles.linkTexto}>Voltar para o Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  erro: { color: 'red', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  botao: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoLink: { marginTop: 20, alignItems: 'center' },
  linkTexto: { color: '#7f8c8d', fontSize: 16 }
});