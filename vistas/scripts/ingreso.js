var tabla;

//Funcion que se ejecuta al inicio
function init()
{
    mostrarform(false);
    listar();

    $("#formulario").on("submit",function(e)
    {
        guardaryeditar(e);
    });

    $.post(
        "../ajax/ingreso.php?op=selectProveedor",
        function(data)
        {
            $("#idproveedor").html(data);
            $("#idproveedor").selectpicker('refresh');
        }
    );
}

//funcion limpiar
function limpiar()
{
    $("#idproveedor").val("");
    $("#proveedor").val("");
    $("#serie_comprobante").val("");
    $("#num_comprobante").val("");
    $("#fecha_hora").val("");
    $("#impuesto").val("0");

    $("#total_compra").val("");
    $(".filas").remove();
    $("#total").html(0);

    //obtenemos la fecha actual
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear()+"-"+(month)+"-"+(day);
    $("#fecha_hora").val(today);

    //Marcar el primer tipo de documento
    $("#tipo_comprobante").val("Boleta");
    $("#tipo_comprobante").selectpicker('refresh');

}

//funcion mostrar formulario
function mostrarform(flag)
{
    limpiar();

    if(flag)
    {
        $("#listadoregistros").hide();
        $("#formularioregistros").show();
        //$("#btnGuardar").prop("disabled",false);
        $("#btnagregar").hide();
        listarArticulos();

        $("#btnguardar").show();
        $("#btnCancelar").show();
        detalles = 0;
        $("#btnAgregarArt").show();
    }
    else
    {
        $("#listadoregistros").show();
        $("#formularioregistros").hide();
        $("#btnagregar").show();
    }
}

//Funcion cancelarform
function cancelarform()
{
    limpiar();
    mostrarform(false);
}

//Funcion listar
function listar()
{
    tabla = $('#tblistado')
        .dataTable(
            {
                "aProcessing":true, //Activamos el procesamiento del datatables
                "aServerSide":true, //Paginacion y filtrado realizados por el servidor
                dom: "Bfrtip", //Definimos los elementos del control de tabla
                buttons:[
                    'copyHtml5',
                    'excelHtml5',
                    'csvHtml5',
                    'pdf'
                ],
                "ajax":{
                    url: '../ajax/ingreso.php?op=listar',
                    type: "get",
                    dataType:"json",
                    error: function(e) {
                        console.log(e.responseText);
                    }
                },
                "bDestroy": true,
                "iDisplayLength": 5, //Paginacion
                "order": [[0,"desc"]] //Ordenar (Columna, orden)
            
            })
        .DataTable();
}


function listarArticulos()
{
    tabla = $('#tblarticulos')
        .dataTable(
            {
                "aProcessing":true, //Activamos el procesamiento del datatables
                "aServerSide":true, //Paginacion y filtrado realizados por el servidor
                dom: "Bfrtip", //Definimos los elementos del control de tabla
                buttons:[
                    
                ],
                "ajax":{
                    url: '../ajax/ingreso.php?op=listarArticulos',
                    type: "get",
                    dataType:"json",
                    error: function(e) {
                        console.log(e.responseText);
                    }
                },
                "bDestroy": true,
                "iDisplayLength": 5, //Paginacion
                "order": [[0,"desc"]] //Ordenar (Columna, orden)
            
            })
        .DataTable();
}

//funcion para guardar o editar
function guardaryeditar(e)
{
    e.preventDefault(); //No se activará la acción predeterminada del evento
	//$("#btnGuardar").prop("disabled",true);
    var formData = new FormData($("#formulario")[0]);
    
    $.ajax({
        url: "../ajax/ingreso.php?op=guardaryeditar",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function(datos)
        {
            //console.log("succes");
            bootbox.alert(datos);
            mostrarform(false);
            listar();

        },
        error: function(error)
        {
            console.log("error: " + error);
        } 
    });

    limpiar();
}

function mostrar(idingreso)
{
    $.post(
        "../ajax/ingreso.php?op=mostrar",
        {idingreso:idingreso},
        function(data,status)
        {

            data = JSON.parse(data);
            mostrarform(true);

            $("#idproveedor").val(data.idproveedor);
            $("#idproveedor").selectpicker('refresh');

            $("#tipo_comprobante").val(data.tipo_comprobante);
            $("#tipo_comprobante").selectpicker('refresh');
            
            $("#serie_comprobante").val(data.serie_comprobante);
            $("#num_comprobante").val(data.num_comprobante);
            $("#fecha_hora").val(data.fecha);
            $("#impuesto").val(data.impuesto);            
            $("#idingreso").val(data.ingreso); 
            
            //Ocultar y mostrar botones
            $("#btnGuardar").hide();
            $("#btnCancelar").show();
            $("#btnAgregarArt").hide();

            $.post(
                "../ajax/ingreso.php?op=listarDetalle&id="+idingreso,
                function(r)
                {
                    $("#detalles").html("");
                    $("#detalles").html(r);
                }
            );

        }
    );

    


}


function anular(idingreso)
{
    bootbox.confirm("¿Estas seguro de anular el Ingreso?",function(result){
        if(result)
        {
            $.post(
                "../ajax/ingeso.php?op=anular",
                {idingreso:idingreso},
                function(e)
                {
                    bootbox.alert(e);
                    tabla.ajax.reload();
        
                }
            );
        }
    });
}

//Variables
var impuesto = 16;
var cont = 0;
var detalles= 0;

$("#btnGuardar").hide();
$("#tipo_comprobante").change(marcarImpuesto);

function marcarImpuesto()
{
    var tipo_comprobante = $("#tipo_comprobante option:selected").text();
    if(tipo_comprobante == 'Factura')
    {
        $("#impuesto").val(impuesto);
    }
    else
    {
        $("#impuesto").val('0');
    }
}

function agregarDetalle(idarticulo,articulo)
{
    var cantidad = 1;
    var precio_compra = 1;
    var precio_venta = 1;

    if(idarticulo != "")
    {
        var subtotal = cantidad * precio_compra;
        var fila = '<tr class="filas" id="fila'+cont+'"> ' +
                      '<td>'+
                           '<button type="button" class="btn btn-danger" onclick="eliminarDetalle('+cont+')">X</button>'+
                       '</td>'+
                      '<td>' +
                          '<input type="hidden" name="idarticulo[]" value="'+idarticulo+'">'+
                           articulo +
                       '</td>'+
                      '<td>' +
                          '<input type="number" name="cantidad[]" id="cantidad[]" value="'+cantidad+'">'+
                       '</td>'+
                      '<td>' +
                          '<input type="number" name="precio_compra[]" id="precio_compra[]" value="'+precio_compra+'">'+
                       '</td>'+
                      '<td>' +
                          '<input type="number" name="precio_venta[]" id="precio_venta[]" value="'+precio_venta+'">'+
                       '</td>'+
                      '<td>' +
                          '<span name="subtotal" id="subtotal'+cont+'">'+subtotal+'</span>'+
                       '</td>'+
                      '<td>' +
                          '<button type="button" class="btn btn-info" onclick="modificarSubtotales()">'+
                            '<i class="fa fa-refresh"></i>'+
                          '</button>'+
                       '</td>'+
                   '</tr>';

        cont++;
        detalles++;
        $("#detalles").append(fila);
        modificarSubtotales(); 
    }
    else
    {
        alert("Error al ingresar el detalle, revisar los ddatos del articulo");
    }
}

function modificarSubtotales()
{
    var cant = document.getElementsByName("cantidad[]");
    var prec = document.getElementsByName("precio_compra[]");
    var sub = document.getElementsByName("subtotal");

    var tamañoCant = cant.length;

    for (var i = 0; i < tamañoCant; i++) 
    {
        var inpC = cant[i];
        var inpP = prec[i];
        var inpS = sub[i];

        inpS.value = inpC.value * inpP.value;
        document.getElementsByName("subtotal")[i].innerHTML = inpS.value;
    }

    calcularTotales();
}

function calcularTotales()
{
    var sub = document.getElementsByName("subtotal");
    var total = 0.0;

    var tamSub = sub.length;

    for (var i = 0; i < tamSub; i++) {
        total += document.getElementsByName("subtotal")[i].value;
    }

    $("#total").html("$ "+ total);
    $("#total_compra").val(total);

    evaluar();
}

function evaluar()
{
    if(detalles > 0)
    {
        $("#btnGuardar").show();
    }
    else
    {
        $("#btnGuardar").hide();
        cont = 0;
    }
}

function eliminarDetalle(indice)
{
    $("#fila" + indice).remove();

    detalles -= 1;

    calcularTotales();

    
}

init();