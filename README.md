# Angular Network-Status

Módulo AngularJS para mostrar o status da conexão com a Internet, com a API da InCeres e também a latência.

## Instalação:
   
    $ bower install network-status --save

Para adicionar no AngularJS, adicione a dependência ao seu app:

    var seuApp = angular.module(
      'seuApp', [
        'network-status'
      ]
    );

## Uso:

O módulo expõe a diretiva `connectionStatus` que adiciona um icone que informa o status da conexão de rede com a Internet.
O módulo expõe a diretiva `apiStatus` que adiciona uma modal que informa o status da conexão com  a API InCeres.

Exemplo de uso:

    <connection-status>
    <api-status>