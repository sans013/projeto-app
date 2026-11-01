import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { perguntarIA } from '../servicos/ia';

export default function Principal({ usuario, onGoToUsuarios, onLogout }) {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const flatListRef = useRef(null);

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;

    const textoUsuario = input.trim();
    
    // Adiciona a pergunta do usuário na tela
    setMensagens((prev) => [
      ...prev, 
      { id: Date.now().toString(), texto: textoUsuario, remetente: 'usuario' }
    ]);
    
    setInput('');
    setCarregando(true);

    // Faz a requisição para a IA
    const respostaIA = await perguntarIA(textoUsuario);

    setCarregando(false);

    // Adiciona a resposta ou o erro na tela
    if (respostaIA && respostaIA.sucesso) {
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          texto: respostaIA.dados.resposta,
          tokens: respostaIA.dados.tokens,
          remetente: 'ia',
          erro: false
        }
      ]);
    } else {
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          texto: respostaIA ? respostaIA.mensagem : 'Erro desconhecido.',
          remetente: 'ia',
          erro: true
        }
      ]);
    }
  };

  const renderizarMensagem = ({ item }) => {
    const isUsuario = item.remetente === 'usuario';

    return (
      <View style={[styles.linhaMensagem, isUsuario ? styles.linhaDireita : styles.linhaEsquerda]}>
        <View style={[styles.balao, isUsuario ? styles.balaoUsuario : styles.balaoIA, item.erro && styles.balaoErro]}>
          <Text style={[styles.textoMensagem, isUsuario ? styles.textoBranco : styles.textoEscuro, item.erro && styles.textoErro]}>
            {item.texto}
          </Text>
        </View>
        
        {/* Mostra os tokens embaixo da resposta da IA, se existirem */}
        {item.tokens !== undefined && !item.erro && (
          <Text style={styles.textoTokens}>Gasto: {item.tokens} tokens</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.saudacao}>Olá, {usuario?.nome || 'Usuário'}!</Text>
        <TouchableOpacity style={styles.botaoSair} onPress={onLogout}>
          <Text style={styles.textoBotaoSair}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuArea}>
        <TouchableOpacity style={styles.botao} onPress={onGoToUsuarios}>
          <Text style={styles.textoBotao}>Gerenciar Usuários</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderizarMensagem}
          contentContainerStyle={styles.listaMensagens}
          // Rola para baixo automaticamente sempre que o tamanho do conteúdo mudar
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.chatPlaceholder}>Como posso te ajudar hoje?</Text>}
        />
        
        {carregando && (
          <View style={styles.indicadorCarregando}>
            <ActivityIndicator size="small" color="#34495e" />
            <Text style={styles.textoPensando}>Pensando...</Text>
          </View>
        )}

        <View style={styles.areaInput}>
          <TextInput
            style={styles.input}
            placeholder="Pergunte algo à IA..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={enviarMensagem}
            editable={!carregando}
          />
          <TouchableOpacity 
            style={[styles.botaoEnviar, carregando && styles.botaoEnviarDesabilitado]} 
            onPress={enviarMensagem}
            disabled={carregando}
          >
            <Text style={styles.textoBotaoEnviar}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  saudacao: { fontSize: 20, fontWeight: 'bold' },
  botaoSair: { padding: 8 },
  textoBotaoSair: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold' },
  menuArea: { padding: 20, paddingBottom: 0 },
  botao: { backgroundColor: '#34495e', padding: 15, borderRadius: 8, alignItems: 'center' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Estilos do Chat
  chatArea: { flex: 1, margin: 20, borderRadius: 8, borderWidth: 1, borderColor: '#dfe4ea', backgroundColor: '#f9f9f9', overflow: 'hidden' },
  listaMensagens: { padding: 15, flexGrow: 1, justifyContent: 'flex-end' },
  chatPlaceholder: { color: '#a4b0be', fontSize: 16, textAlign: 'center', marginTop: 20 },
  
  linhaMensagem: { marginBottom: 15, maxWidth: '80%' },
  linhaDireita: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  linhaEsquerda: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  
  balao: { padding: 12, borderRadius: 12 },
  balaoUsuario: { backgroundColor: '#3498db', borderBottomRightRadius: 0 },
  balaoIA: { backgroundColor: '#e1e2e6', borderBottomLeftRadius: 0 },
  balaoErro: { backgroundColor: '#ffeded', borderWidth: 1, borderColor: '#ffcccc' },
  
  textoMensagem: { fontSize: 15, lineHeight: 22 },
  textoBranco: { color: '#fff' },
  textoEscuro: { color: '#2f3640' },
  textoErro: { color: '#e74c3c', fontWeight: '500' },
  
  textoTokens: { fontSize: 11, color: '#7f8fa6', marginTop: 4, marginLeft: 4 },
  
  indicadorCarregando: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  textoPensando: { marginLeft: 8, color: '#7f8fa6', fontStyle: 'italic' },
  
  areaInput: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#dfe4ea', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, height: 45, backgroundColor: '#fff' },
  botaoEnviar: { backgroundColor: '#2ecc71', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 20, marginLeft: 10 },
  botaoEnviarDesabilitado: { backgroundColor: '#bdc3c7' },
  textoBotaoEnviar: { color: '#fff', fontWeight: 'bold' }
});