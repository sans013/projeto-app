import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { listarUsuarios } from '../servicos/api';

export default function Usuarios({ onGoBack, onEditUser, onSessionExpired }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await listarUsuarios();
      if (res.sucesso) {
        setUsuarios(res.dados);
      } else {
        setErro(res.mensagem || 'Erro ao carregar lista.');
      }
    } catch (err) {
      if (err.message === '401_UNAUTHORIZED') {
        onSessionExpired();
      } else {
        setErro(err.message);
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    (u.nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.botaoVoltar}>{"< Voltar"}</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Usuários</Text>
      </View>

      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar por nome..."
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <FlatList
        data={usuariosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onEditUser(item)}>
            <View>
              <Text style={styles.nomeItem}>{item.nome} {item.sobrenome}</Text>
              <Text style={styles.usuarioItem}>@{item.usuario}</Text>
            </View>
            <Text style={styles.seta}>{">"}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  botaoVoltar: { fontSize: 16, color: '#3498db', marginRight: 15 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  buscaContainer: { padding: 15 },
  inputBusca: { backgroundColor: '#f1f2f6', borderRadius: 8, padding: 12, fontSize: 16 },
  erro: { color: 'red', marginHorizontal: 15, marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  nomeItem: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  usuarioItem: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  seta: { fontSize: 18, color: '#bdc3c7' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#7f8c8d' }
});