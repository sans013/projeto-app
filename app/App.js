import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { setToken, clearToken } from './servicos/api';

import Login from './telas/Login';
import Cadastro from './telas/Cadastro';
import Principal from './telas/Principal';
import Usuarios from './telas/Usuarios';
import EditarUsuario from './telas/EditarUsuario';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('Login');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagemSessao, setMensagemSessao] = useState('');

  // Gerenciador de navegação simples
  const navegar = (tela, params = null) => {
    if (params?.usuarioSelecionado) {
      setUsuarioSelecionado(params.usuarioSelecionado);
    }
    setTelaAtual(tela);
  };

  const handleLogin = (dados, token) => {
    setToken(token); // Guarda o token na memória (api.js)
    setUsuarioLogado(dados);
    setMensagemSessao('');
    navegar('Principal');
  };

  const handleLogout = (mensagem = '') => {
    clearToken(); // Apaga o token da memória
    setUsuarioLogado(null);
    setMensagemSessao(mensagem);
    navegar('Login');
  };

  const handleSessionExpired = () => {
    handleLogout('Sua sessão expirou, entre de novo.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
      <View style={styles.content}>
        {telaAtual === 'Login' && (
          <Login
            onLogin={handleLogin}
            onGoToCadastro={() => navegar('Cadastro')}
            mensagemSessao={mensagemSessao}
          />
        )}
        {telaAtual === 'Cadastro' && (
          <Cadastro onGoBack={() => navegar('Login')} />
        )}
        {telaAtual === 'Principal' && (
          <Principal
            usuario={usuarioLogado}
            onGoToUsuarios={() => navegar('Usuarios')}
            onLogout={() => handleLogout()}
          />
        )}
        {telaAtual === 'Usuarios' && (
          <Usuarios
            onGoBack={() => navegar('Principal')}
            onEditUser={(user) => navegar('EditarUsuario', { usuarioSelecionado: user })}
            onSessionExpired={handleSessionExpired}
          />
        )}
        {telaAtual === 'EditarUsuario' && (
          <EditarUsuario
            usuario={usuarioSelecionado}
            onGoBack={() => navegar('Usuarios')}
            onSessionExpired={handleSessionExpired}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    maxWidth: 600, // Limita a largura para ficar elegante na Web
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});