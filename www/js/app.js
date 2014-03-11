
  var AlertasApp = angular.module('AlertasApp', ['ngRoute','geolocation']);


  //RUTAS
  AlertasApp.config(function($routeProvider) {
    $routeProvider
      //INICIO -> Selecciona el usuario
      .when('/', {
        templateUrl : 'paginas/seleccionar_usuario.html',
        controller  : 'SeleccionarUsuario'
      })

      // Guardar un punto particular
      .when('/marcar_punto', {
        templateUrl : 'paginas/marcar_punto.html',
        controller  : 'MarcarPunto'
      })

      // Subir una Alerta
      .when('/marcar_alerta', {
        templateUrl : 'paginas/marcar_alerta.html',
        controller  : 'MarcarAlerta'
      })

      // Ver Alertas sobre su geolocalizacion
      .when('/ver_alertas', {
        templateUrl : 'paginas/alertas.html',
        controller  : 'VerAlertas'
      })

      // Ver Alertas sobre un punto 
      .when('/ver_alertas_en/:punto', {
        templateUrl : 'paginas/alertas.html',
        controller  : 'VerAlertasEn'
      })

      // Ver Mis Puntos
      .when('/puntos', {
        templateUrl : 'paginas/puntos.html',
        controller  : 'MisPuntos'
      })
      .otherwise({
        redirectTo: '/'
      });
      
  });

  // DECLARACION DE SERVICIOS INICIO

  //SERVICIO PARA CONTROLAR EL USUARIO
  AlertasApp.factory('ServiciosUsuarios', function($rootScope) {
      var ServicioUsuario = {};

      ServicioUsuario.usuarios = [
        {nombre:'Juan', id:'1'},
        {nombre:'Pepe', id:'2'},
        {nombre:'Laura', id:'3'}
      ];      
      ServicioUsuario.usuario = ServicioUsuario.usuarios[0]; // INICIALIZACION

      ServicioUsuario.SeleccionarUsuario = function(user) {

          this.usuario = user;

          this.GuardarUsuario();
      };

      ServicioUsuario.GuardarUsuario = function() {

          $rootScope.$broadcast('UsuarioElegido');

      };

      return ServicioUsuario;
  });
  //SERVICIO PARA CONTROLAR EL USUARIO

  //SERVICIO PARA CONTROLAR LA UBICACION DEL USUARIO
  AlertasApp.factory('ServiciosUbicacion',function($rootScope,geolocation) {

      var apply = function () {
                $rootScope.$apply();
            };
     
      var ServicioUbicacion = {};

      ServicioUbicacion.latitud = null;
      ServicioUbicacion.longitud = null;


      ServicioUbicacion.Geolocalizar = function($scope) {
            //console.log("Va a Geolocalizar");
            geolocation.getLocation().then(function(data){
              $rootScope.latitud = data.coords.latitude;
              $rootScope.longitud = data.coords.longitude;
              //console.log("rootScope.latitud: " + $rootScope.latitud);
              //console.log("rootScope.longitud: " + $rootScope.longitud);
            });



            this.latitud = $rootScope.latitud;
            this.longitud = $rootScope.longitud;
            //console.log("this.latitud: " + this.latitud);
            //console.log("this.longitud: " + this.longitud);
            this.GuardarUbicacion();
      };

      ServicioUbicacion.GuardarUbicacion = function() {
          //console.log("LAta:" + this.latitud + "LONGa:" + this.longitud);
          $rootScope.$broadcast('UsuarioUbicado');

      };

      return ServicioUbicacion;
  });

  //SERVICIO PARA CONTROLAR LA UBICACION DEL USUARIO

  //SERVICIO PARA CONTROLAR LOS PUNTOS DEL USUARIO
  AlertasApp.factory('ServiciosPuntos', function($rootScope) {
      var ServicioPunto = {};

      ServicioPunto.puntos = null; // INICIALIZACION
      //console.log(" INICIALIZACION Puntos");
      ServicioPunto.CargarPuntos = function(puntos) {
          console.log("CargarPuntos "  + puntos.length);
          this.puntos = puntos;

          this.GuardarPuntos();
      };

      ServicioPunto.GuardarPuntos = function() {
          //console.log("GuardarPuntos");
          $rootScope.$broadcast('PuntosActualizados');
      };

      return ServicioPunto;
  });
  //SERVICIO PARA CONTROLAR LOS PUNTOS DEL USUARIO

 // DECLARACION DE SERVICIOS FIN


 //CONTROLADORES INICIO
  function SeleccionarUsuario($scope, ServiciosUsuarios) {
    $scope.usuarios = ServiciosUsuarios.usuarios;

    $scope.guardar_usuario = function(user) {
        ServiciosUsuarios.SeleccionarUsuario(user);
    };
        
    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    //SERVICIOS FIN     
  }
  SeleccionarUsuario.$inject = ['$scope', 'ServiciosUsuarios'];

  function MarcarPunto($scope, ServiciosUsuarios,ServiciosUbicacion,$location,$http) {  

    //CONTROL POR SI NO SELECCIONO EL USUARIO
    if (!$scope.usuario)
    {
        $location.path("/");
    }else
    {
        //console.log("MarcarPunto Usuario: " + $scope.usuario.nombre);
    }
    //CONTROL POR SI NO SELECCIONO EL USUARIO

    ServiciosUbicacion.Geolocalizar();

    //GUARDAR PUNTO
    $scope.enviar = function(user_id, titulo, longitud, latitud) {
      //console.log("Guardar user_id: " + user_id);
      //console.log("Guardar titulo: " + titulo);
      //console.log("Guardar longitud: " + longitud);
      //console.log("Guardar latitud: " + latitud);

      $ruta = "http://mumaplay.com/ANR/guardar_punto.php?callback=JSON_CALLBACK";
      $ruta = $ruta + "&usuario=" + user_id;
      $ruta = $ruta + "&titulo=" + titulo;
      $ruta = $ruta + "&longitud=" + longitud;
      $ruta = $ruta + "&latitud=" + latitud;

      $http({
          method: 'JSONP',
          url: $ruta,            
        }).success(function(data, status, headers, config) {
          $scope.mensaje_guardar_punto = "Se guardó tu punto";
          $location.path("/puntos");
        }).error(function(data, status, headers, config) {
          $scope.mensaje_guardar_punto = "Tuvimos un problema, intentalo más tarde";
        });
    }
    //GUARDAR PUNTO

    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    $scope.$on('UsuarioUbicado', function() {
        $scope.latitud = ServiciosUbicacion.latitud;
        $scope.longitud = ServiciosUbicacion.longitud;
    });             
    //SERVICIOS FIN
  }
  MarcarPunto.$inject = ['$scope', 'ServiciosUsuarios','ServiciosUbicacion','$location','$http'];

  function MarcarAlerta($scope,ServiciosUsuario,ServiciosUbicacion,$location,$http) {
    //CONTROL POR SI NO SELECCIONO EL USUARIO
    if (!$scope.usuario)
    {
        $location.path("/");
    }else
    {
        //console.log("MarcarAlerta Usuario: " + $scope.usuario.nombre);
    }
    //CONTROL POR SI NO SELECCIONO EL USUARIO

    ServiciosUbicacion.Geolocalizar();

    //GUARDAR ALERTA
    $scope.enviar_alerta = function(user_id, titulo_alerta, descripcion_alerta, longitud, latitud) {
      //console.log("Guardar user_id: " + user_id);
      //console.log("Guardar titulo_alerta: " + titulo_alerta);
      //console.log("Guardar descripcion_alerta: " + descripcion_alerta);
      //console.log("Guardar longitud: " + longitud);
      //console.log("Guardar latitud: " + latitud);

      $ruta = "http://mumaplay.com/ANR/guardar_alerta.php?callback=JSON_CALLBACK";
      $ruta = $ruta + "&usuario=" + user_id;
      $ruta = $ruta + "&titulo_alerta=" + titulo_alerta;
      $ruta = $ruta + "&descripcion_alerta=" + descripcion_alerta;
      $ruta = $ruta + "&longitud=" + longitud;
      $ruta = $ruta + "&latitud=" + latitud;

      $http({
          method: 'JSONP',
          url: $ruta,            
        }).success(function(data, status, headers, config) {
          $scope.mensaje_guardar_alerta = "Se guardó tu alerta";
          $location.path("/ver_alertas");
        }).error(function(data, status, headers, config) {
          $scope.mensaje_guardar_alerta = "Tuvimos un problema, intentalo más tarde";
        });
    }
    //GUARDAR ALERTA

    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    $scope.$on('UsuarioUbicado', function() {
        $scope.latitud = ServiciosUbicacion.latitud;
        $scope.longitud = ServiciosUbicacion.longitud;
    });             
    //SERVICIOS FIN
  } 
  MarcarAlerta.$inject = ['$scope', 'ServiciosUsuarios','ServiciosUbicacion','$location','$http'];

  function VerAlertas($scope,ServiciosUsuario,ServiciosUbicacion,$location,$http)
  {
    //CONTROL POR SI NO SELECCIONO EL USUARIO
    if (!$scope.usuario)
    {
        $location.path("/");
    }
    //CONTROL POR SI NO SELECCIONO EL USUARIO

    ServiciosUbicacion.Geolocalizar();

    $ruta = "http://mumaplay.com/ANR/traer_alertas.php?callback=JSON_CALLBACK";
    $ruta = $ruta + "&latitud=" + $scope.latitud;
    $ruta = $ruta + "&longitud=" + $scope.longitud;

    $http({
        method: 'JSONP',
        url: $ruta,            
      }).success(function(data, status, headers, config) {
        $scope.alertas = data;
        
      }).error(function(data, status, headers, config) {
        $scope.alertas = null;
      });  

    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    $scope.$on('UsuarioUbicado', function() {
        $scope.latitud = ServiciosUbicacion.latitud;
        $scope.longitud = ServiciosUbicacion.longitud;
    });             
    //SERVICIOS FIN  

  }
  VerAlertas.$inject = ['$scope', 'ServiciosUsuarios','ServiciosUbicacion','$location','$http']; 


  function VerAlertasEn($scope,ServiciosUsuario,ServiciosUbicacion,ServiciosPuntos,$location,$http,$routeParams,$filter)
  {

    //CONTROL POR SI NO SELECCIONO EL USUARIO
    if (!$scope.usuario)
    {
        $location.path("/");
    }
    //CONTROL POR SI NO SELECCIONO EL USUARIO

    console.log("VER ALERTAS DE PUNTO: " + $routeParams.punto );
    console.log("scope.latitud = " + $scope.latitud);
    console.log("scope.longitud = " + $scope.longitud);

    $scope.queryData = $filter('filter')(ServiciosPuntos.puntos, "id = 78");
    for (var i = 0; i < ServiciosPuntos.puntos.length; i++) {
      if (ServiciosPuntos.puntos[i].id === $routeParams.punto) {
        $scope.latitud = ServiciosPuntos.puntos[i].latitud;
        $scope.longitud = ServiciosPuntos.puntos[i].longitud;
      }
    }
    console.log("scope.latitud = " + $scope.latitud);
    console.log("scope.longitud = " + $scope.longitud);

    //console.log("VALORES DE PUNTO: " + $scope.coordenadas.latitud + ", " + $scope.coordenadas.longitud );

    $ruta = "http://mumaplay.com/ANR/traer_alertas.php?callback=JSON_CALLBACK";
    $ruta = $ruta + "&latitud=" + $scope.latitud;
    $ruta = $ruta + "&longitud=" + $scope.longitud;

    $http({
        method: 'JSONP',
        url: $ruta,            
      }).success(function(data, status, headers, config) {
        $scope.alertas = data;
        
      }).error(function(data, status, headers, config) {
        $scope.alertas = null;
      });  

    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    $scope.$on('UsuarioUbicado', function() {
        $scope.latitud = ServiciosUbicacion.latitud;
        $scope.longitud = ServiciosUbicacion.longitud;
    });  
    $scope.$on('PuntosActualizados', function() {
        console.log("PuntosActualizados "  + ServiciosPuntos.puntos.length);
        $scope.puntos = ServiciosPuntos.puntos;
    });             
    //SERVICIOS FIN
  }
  VerAlertasEn.$inject = ['$scope', 'ServiciosUsuarios','ServiciosUbicacion','ServiciosPuntos','$location','$http','$routeParams','$filter'];

  //AlertasApp.controller('MisPuntos', function($scope,$http) {
  function MisPuntos($scope,ServiciosUsuario,ServiciosUbicacion,ServiciosPuntos,$location,$http){  
    //CONTROL POR SI NO SELECCIONO EL USUARIO
    if (!$scope.usuario)
    {
        $location.path("/");
    }else
    {
        //console.log("MisPuntos Usuario: " + $scope.usuario.nombre);
    }
    //CONTROL POR SI NO SELECCIONO EL USUARIO

    $ruta = "http://mumaplay.com/ANR/traer_puntos.php?callback=JSON_CALLBACK";
    $ruta = $ruta + "&usuario=" + $scope.usuario.id;

    $http({
        method: 'JSONP',
        url: $ruta,            
      }).success(function(data, status, headers, config) {
        //$scope.puntos = data;
        //console.log("Va a actualizar los puntos " + data.length);
        ServiciosPuntos.CargarPuntos(data);
      }).error(function(data, status, headers, config) {
        //$scope.puntos = null;
        ServiciosPuntos.CargarPuntos(null);
      });

    //SERVICIOS INICIO
    $scope.$on('UsuarioElegido', function() {
          $scope.usuario = ServiciosUsuarios.usuario;
      });   
    $scope.$on('UsuarioUbicado', function() {
        $scope.latitud = ServiciosUbicacion.latitud;
        $scope.longitud = ServiciosUbicacion.longitud;
    }); 
    $scope.$on('PuntosActualizados', function() {
        //console.log("PuntosActualizados "  + ServiciosPuntos.puntos.length);
        $scope.puntos = ServiciosPuntos.puntos;
    });                   
    //SERVICIOS FIN      
  }
   
  MisPuntos.$inject = ['$scope', 'ServiciosUsuarios','ServiciosUbicacion','ServiciosPuntos','$location','$http'];


  // CATEGORIAS INICIO
  function GestionCategorias($scope)
  {
      $scope.categorias = [
      {id:'1',nombre:'Gourmet',seleccionada:false,color:"rgb(163, 163, 224)"},
      {id:'2',nombre:'Tránsito',seleccionada:false,color:"rgb(151, 245, 33)"},
      {id:'3',nombre:'Deporte',seleccionada:false,color:"rgb(243, 243, 66)"},
      ];
      // ARREGLO DE SELECCIONES DE CATEGORIAS
      $scope.selection = [];

      // helper method
      $scope.categoriasSeleccionadas = function categoriasSeleccionadas() {
      return filterFilter($scope.categorias, { seleccionada: true });
      };

      // watch fruits for changes
      $scope.$watch('categorias|filter:{seleccionada:true}', function (nv) {
      $scope.selection = nv.map(function (categoria) {
        return categoria.id;
      });
      }, true); 
  }
  // CATEGORIAS FIN

  //CONTROLADORES FIN