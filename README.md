# Angular Network-Status

Módulo AngularJS para mostrar o status da conexão com a Internet, com a API da InCeres e também a latência.

## Instalação:
   
    $ bower install network-status --save

No app.js:

Para adicionar no AngularJS, adicione a dependência ao seu app:

    var seuApp = angular.module(
      'seuApp', [
        'network-status'
      ]
    );


Na seção config adicione:

    $httpProvider.interceptors.push('ConnectionStatus');

Na seção run adicione:

    $rootScope.connection = {
      iamOnline: false,
      isLatencyOkay: true,
      isApiAccessible: false,
      countDown: 15,
      showTryFailed: false,
      message: 'Você possui conexão com a internet'
    };
    
No Gruntfile.js:
 
Adicione na seção components/src:

    "src/lib/network-status/dist/js/network-status.js"

Adicione na seção copy/img:

    {expand: true, cwd: 'src/lib/network-status/dist/img', src: ['notwifi.svg'], dest: wwwImgFolder}

No style.scss:

Adicione na seção de imports:

    @import "network-status/dist/scss/network-status";

## Uso:

O módulo expõe a diretiva `connectionStatus` que adiciona um ícone(WiFi) que informa o status da conexão de rede com a Internet e também se a conexão está lenta trocando a cor e a mensagem de título.<br>
O módulo também expõe a diretiva `apiStatus` que adiciona uma modal que bloqueia a tela informando que há problemas na conexão e vai tentar reconectar a cada X segundos.

Exemplo de uso:

    <connection-status/>
    <api-status/>