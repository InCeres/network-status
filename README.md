# Angular Network-Status

Módulo AngularJS para mostrar o status da conexão com a Internet, com a API da InCeres e também a latência.

## Instalação:
   
    $ bower install network-status --save

No app.js:

Para adicionar no AngularJS, adicione a dependência ao seu app:

    var seuApp = angular.module(
      'seuApp', [
        'networkStatus'
      ]
    );


Na seção config adicione:

    $httpProvider.interceptors.push('ConnectionStatus');

Na seção run adicione:

    $rootScope.connection = {
      iamOnline: true,
      isLatencyOkay: true,
      isApiAccessible: true,
      showTryFailed: false,
      message: 'Você possui conexão com a internet',
      countDown: 0,
      refreshInterval: 15,
      waitForNextTry: 3,
      maximumLatency: 1.5,
      networkStatusInterval: 2
    };
    
Onde os parâmetros abaixo podem ser ajustados:<br>
    `refreshInterval`, é o tempo de espera em segundos para cada nova tentativa de se conectar a API, ajuste por projeto/ambiente.<br>
    `waitForNextTry`, é o tempo em segundos que a mensagem de retorno da tentativa fica em exibição, o tempo deve ser suficiente para a leitura.<br>
    `maximumLatency`, é o tempo máximo em segundos para que a latência seja considerada ruim, deve ser ajudado por projeto/ambiente.<br>
    `networkStatusInterval`, é o tempo em segundos para a verificação de conexão com a Internet, ajuste com critério pois fica em repetição.<br>   
    
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