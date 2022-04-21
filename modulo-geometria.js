

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/


var superficie3D;
var mallaDeTriangulos;


function crearGeometria(){
        
    if (superficie == 'plano') {
        superficie3D = new Plano(3,3);
    }
    else if (superficie == 'esfera') {
        superficie3D = new Esfera(radio);
    }
    else if (superficie == 'tubo senoidal') {
        superficie3D = new TuboSenoidal(amplitud, longitud, radio, altura);
    }
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


class Esfera {

    constructor(radio) {
        this.radio = radio;
    }

    getPosicion(u, v) {
        let y = radio * (2.0 * v - 1.0);
        let r = 2.0 * radio * Math.sqrt(v - v * v);
        let x = r * Math.sin(u * 2.0 * Math.PI);
        let z = r * Math.cos(u * 2.0 * Math.PI);
        return [x, y, z];
    }

    getNormal(u, v) {
        let [x, y, z] = this.getPosicion(u, v);
        let norm = Math.sqrt(x*x + y*y + z*z);
        return [x/norm, y/norm, z/norm];
    }

    getCoordenadasTextura(u,v) {
        return [u, v];
    }
}

class TuboSenoidal {

    constructor(amplitud, longitud, radio, altura) {
        this.amplitud = amplitud;
        this.longitud = longitud;
        this.radio = radio;
        this.altura = altura;
    }

    getPosicion(u, v) {
        let y = altura * (v - 0.5);
        let r = radio - amplitud * Math.sin(v * 2.0 * Math.PI * altura / longitud);
        let x = r * Math.sin(u * 2.0 * Math.PI);
        let z = r * Math.cos(u * 2.0 * Math.PI);
        return [x, y, z];
    }

    getNormal(u, v) {
        let w = 2.0 * Math.PI * altura / longitud;
        let x = Math.sin(u * 2.0 * Math.PI);
        let z = Math.cos(u * 2.0 * Math.PI);
        let y = amplitud * Math.cos(v * w) * w;
        let norm = Math.sqrt(x*x + y*y + z*z);
        return [x/norm, y/norm, z/norm];
    }

    getCoordenadasTextura(u,v){
        return [u, v];
    }
}




function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    
    indexBuffer=[];

    cell2index = (row, col) => row * (columnas + 1) + col;
    for (i=0; i < filas; i++) {
        for (j=0; j <= columnas; j++) {

            // completar la lógica necesaria para llenar el indexbuffer en funcion de filas y columnas
            // teniendo en cuenta que se va a dibujar todo el buffer con la primitiva "triangle_strip" 
            indexBuffer.push(cell2index(i, j), cell2index(i + 1, j));
        }
        // Lógica para el cambio de fila
        if (i < (filas - 1)) {
            indexBuffer.push(cell2index(i + 1, j), cell2index(i, j));
        }
    }

    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

