# ANAR_MEMORIA
Juego de memoria para el Archivo Nacional de Arte Rupestre desarrollado por
estudiantes de la Universidad Simón Bolívar como parte de su proyecto de
servicio comunitario.

## Instalación

Con la excepción de la base de datos, la aplicación se ejecuta completamente en
el navegador. Las librerias que necesita están contenidas en este repositorio.
Para manejarlas, es recomendable que instales [Bower](http://bower.io/).

Los datos de los usuarios se pueden guardar tanto en el navegador (solo están
    disponibles de forma local) como en una base de datos remota.

Una vez que hayas escogido como guardar los datos, basta que sirvas el archivo
index.html usando el servidor web de tu preferencia. Te recomendamos [Nginx](https://www.nginx.com/).

## Configuración del Servidor

La aplicación cliente y servidor trabajan de manera independiente. El cliente se conecta
al servidor mediante una API configurada con el framework [Loopback](https://loopback.io/).
Usando [Socket.io](https://socket.io/) para la conexión en tiempo real.

Primero, hay que asegurarse de tener todas las dependencias instaladas corriendo desde el
directorio ./anar_gameserver:

```bash
$ npm install
```

Para correr la aplicación servidor, basta ejecutar desde el mismo directorio
./anar_gameserver:

```bash
$ node .
```
Una vez corriendo, este estará disponible para aceptar peticiones en el host
http://0.0.0.0:3000/ y una lista completa de la API puede ser consultada
visitando http://0.0.0.0:3000/explorer/.


### Guardando los datos localmente

Para guardar los datos de los usuarios localmente, basta con que modifiques la
siguiente línea en [database.js](app/database/database.js):

```javascript
var db_user = new PouchDB('http://memoria-anar-alfjf.c9users.io:8081/anar_user', {ajax: {timeout: 10000}});
```

Sustituyéndola por:
```javascript
var db_user = new PouchDB('anar_user');
```

Los usuarios que crees solo estarán disponibles en el navegador/computadora que uses para crearlos.

### Guardando los datos en una base de datos remota

Para guardar los datos de los usuarios se usa [CouchDB](http://couchdb.apache.org/), ya que la base de datos que se usa en el
 navegador para niveles y cartas ([PouchDB](http://pouchdb.com/)) puede
  comunicarse con CouchDB sin necesidad de configuración adicional.
Si tu distribución de preferencia es Debian Jessie, te recomendamos
[estas instrucciones](https://forum.cozy.io/t/how-to-install-couchdb-manually-on-debian-jessie/1230).
Para otras distribuciones, empieza revisando su sitio web.

Una vez instalado, deberás
[asegurar la instalación](http://guide.couchdb.org/draft/security.html),
habilitar [CORS](http://docs.couchdb.org/en/1.3.0/cors.html) y crear la base
de datos.

Puedes habilitar CORS usando los archivos de configuración (local.ini) o los
siguientes comandos. Para CouchDB < 2.0:


```bash
HOST=http://adminname:password@localhost:5984 # aquí tus datos de administrador

curl -X PUT $HOST/_config/httpd/enable_cors -d '"true"'
curl -X PUT $HOST/_config/cors/origins -d '"*"'
curl -X PUT $HOST/_config/cors/credentials -d '"true"'
curl -X PUT $HOST/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
curl -X PUT $HOST/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'
```

Para un nodo de CouchDB >= 2.0:

```bash
curl -X PUT $HOST/_node/node1@127.0.0.1/_config/httpd/enable_cors -d '"true"'
curl -X PUT $HOST/_node/node1@127.0.0.1/_config/cors/origins -d '"*"'
curl -X PUT $HOST/_node/node1@127.0.0.1/_config/cors/credentials -d '"true"'
curl -X PUT $HOST/_node/node1@127.0.0.1/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
curl -X PUT $HOST/_node/node1@127.0.0.1/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'
```

Para crear la base de datos ejecuta el siguiente comando con los datos apropiados:
```bash
curl -X PUT $HOST/tu_base_de_datos
```

Actualmente, la aplicación usa una instancia de CouchDB instalada en un
workspace de [Cloud9](https://c9.io). Puedes modificarla para usar tu propia
instancia de la base de datos modificando la siguiente linea en [database.js](app/database/database.js):

```javascript
var db_user = new PouchDB('http://memoria-anar-alfjf.c9users.io:8081/anar_user', {ajax: {timeout: 10000}});
```
Sustituye el URL por el de tu propia base de datos.


## Referencias
- http://bower.io/
- https://angularjs.org/
- http://pouchdb.com/
- http://couchdb.apache.org/
- http://getbootstrap.com/
- https://github.com/FezVrasta/bootstrap-material-design
- https://loopback.io/
- https://socket.io/
