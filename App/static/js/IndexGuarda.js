let nome = document.querySelector('#usuario-nome-JS').textContent;
let estado_guarda = document.querySelector('#estado');
window.addEventListener('click', function () {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:5000/guarda/${nome}/0`);
    
    xhr.addEventListener('load',() => {
        
        if (xhr.status == 200) {
            let resultados = JSON.parse(xhr.responseText);
            let div_btns = document.querySelector('#botoes-decisao-JS');
            estado_guarda.textContent = resultados['estado'];
            if(resultados['estado'].toLowerCase() == 'a caminho'){
                div_btns.innerHTML = 
                    `
                        <button id="fechar_cancela" class="form-control btn btn-danger">Fechar Cancela</button>
                        <button id="abrir_cancela" class="form-control btn btn-success">Abrir Cancela</button>
                    `;
                let xhr2 = new XMLHttpRequest();
                xhr2.open("GET", `http://localhost:5000/pedido_guarda/${nome}/1`);
                
                xhr2.addEventListener('load', () => {
                    
                    if (xhr2.status == 200) {
                        let pedidos = JSON.parse(xhr2.responseText);                        
                        pedidos.forEach(element => {
                            let placa = '';
                            let xhr3 = new XMLHttpRequest();
                            xhr3.open("GET", `http://localhost:5000/info_cargas/placa/${element['id_carga']}`);
                            xhr3.addEventListener('load', () => {
                                if (xhr3.status == 200) {
                                    placa = JSON.parse(xhr3.responseText)[0]['placa'];
                                    div_btns.innerHTML +=`<form action="/acao_guarda" method="POST">
                                            <input type="hidden" name="id" value="${element['id']}">
                                            <input type="hidden" name="id_carga" value="${element['id_carga']}">
                                            <input type="hidden" name="guarda" value="${element['nome']}">
                                            <button class="btn btn-primary form-control">Finalizar Carga - ${placa}</button>
                                    </form>`;                                    
                                }
                            });
                            xhr3.send();
                        });
                    }
                });
                xhr2.send();
            

            }
            // else{
            //     div_btns.innerHTML =
            //     `
            //         <button class="form-control btn btn-danger" id="estado_1">Oculpado</button>
            //         <button id="estado_2" class="form-control btn btn-success">Disponivel</button>
            //     `;
            // }
        }
    });
    xhr.send();
        } ());
$(document).ready(function () {

    var socket = io.connect('http://127.0.0.1:5000/estadoGuarda');
    socket.emit('username', nome);
    $('#estado_1').on('click', function () {
        var message = $('#estado_1').text();
        console.log(message);
        socket.emit('estado', { 'user': nome, 'msg': 1 });
    });
    $('#estado_2').on('click', function () {
        var message = $('#estado_2').text();
        console.log(message);
        socket.emit('estado', { 'user': nome, 'msg': 2 });
    });

    socket.on('estado_resposta', function (msg) {
        
        console.log(`RESPOSTA SERVIDOR ${msg}`);

        estado_guarda.textContent = msg==3?"A caminho":msg == 1?"Oculpado":"Disponivel";
    });
});