<?php
  //Activacion de almacenamiento en buffer
  ob_start();
  
  if(strlen(session_id()) < 1) //Si la variable de session no esta iniciada
  {
    session_start();
  } 

  if(!isset($_SESSION["nombre"]))
  {
    echo 'Debe ingresar al sistema correctamente para visualizar el reporte';
  }

  else  //Agrega toda la vista
  {

    if($_SESSION['ventas'] == 1)
    {
        //Incluimos archivo Factura.php
        require 'Factura.php';

        //Datos
        $logo = "logo.jpg";
        $ext_logo = "jpg";
        $empresa = "SOLUCIONES TECNOLOGICAS";
        $documento = "09912002345";
        $direccion = "Changolandia, Conocido 1279";
        $telefono = "9789267890";
        $email = "empresa@gmail.com";

        //Obtenemos los datos de la cabecera
        require_once '../modelos/Venta.php';
        $venta = new Venta();

        $rsptav = $venta->ventaCabecera($_GET['id']);

        //Recorremos los datos obtenidos
        $regv = $rsptav->fetch_object();

        $pdf = new PDF_Invoice('P','mm','A4');
        $pdf->AddPage();

        //Enviamos los datos de la empresa al metodo addSociete de la clase factura
        //Para ubicar los datos correspondientes
        $pdf->addSociete(
            utf8_decode($empresa),
            $documento."\n".
            utf8_decode("Dirección: ").utf8_decode($direccion)."\n".
            utf8_decode("Teléfono: ").utf8_decode($telefono)."\n".
            "Email: ".$email,
            $logo,
            $ext_logo
        );
        
        $pdf->fact_dev(
            "$regv->tipo_comprobante ",
            "$regv->serie_comprobante - $regv->num_comprobante"
        );

        $pdf->temporaire( "" ); //Marca de Agua
        $pdf->addDate($regv->fecha);

        //Enviar los datos del cliente al metodo addClienteAdresse de la clase Factura
        $pdf->addClientAdresse(
            utf8_decode($regv->cliente),
            "Domicilio: ".utf8_decode($regv->direccion),
            $regv->tipo_documento.": ".$regv->num_documento,
            "Email: ".$regv->email,
            "Telefono: ".$regv->telefono 
        );

        //Establecemos las columnas que va a tener la seccion donde mostramos los detalles de la venta
        $cols=array(
            "CODIGO"=>23,
            "DESCRIPCION"=>78,
            "CANTIDAD"=>22,
            "P.U"=>25,
            "DSCTO"=>20,
            "SUBTOTAL"=>22
        );
        $pdf->addCols($cols);

        $cols = array(
            "CODIGO"=>"L", //Alineacion (Left)
            "DESCRIPCION"=>"L",
            "CANTIDAD"=>"C",
            "P.U"=>"R",
            "DSCTO"=>"R",
            "SUBTOTAL"=>"C",
        );
        $pdf->addLineFormat($cols);
        $pdf->addLineFormat($cols);

        //Actualizamos el valos de la coordenada "y", que sera la ubicacion desde donde empezaremos a mostrar los datos
        $y = 89;

        //Obtenemos todos los detalles de la venta actual
        $rsptad = $venta->ventaDetalle($_GET['id']);

        while($regd = $rsptad->fetch_object())
        {
            $line = array(
                "CODIGO"=>"$regd->codigo",
                "DESCRIPCION"=>utf8_decode("$regd->articulo"),
                "CANTIDAD"=>"$regd->cantidad",
                "P.U"=>"$regd->precio_venta",
                "DSCTO"=>"$regd->descuento",
                "SUBTOTAL"=>"$regd->subtotal",
            );
            $size = $pdf->addLine($y,$line);
            $y += $size + 2;

        }

        //Convertimos el total en letras
        require_once 'Letras.php';
        $v = new EnLetras();

        $con_letra = strtoupper(
            $v->ValorEnLetras($regv->total_venta,"PESOS MEXICANOS")
        );
        $pdf->addCadreTVAs("---".$con_letra);

        //Mostramos el impuesto
        $pdf->addTVAs(
            $regv->impuesto,
            $regv->total_venta,
            "$ "
        );
        $pdf->addCadreEurosFrancs("IVA"." $regv->impuesto %");
        $pdf->Output("Reporte de Venta", "I");

    } 

    else
    {
        echo 'No tiene permiso para visualizar el reporte';
    }


   }
   ob_end_flush(); //liberar el espacio del buffer
?>