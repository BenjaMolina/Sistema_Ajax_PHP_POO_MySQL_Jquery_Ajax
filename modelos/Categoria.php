<?php
    require '../config/conexion.php';

    Class Categoria 
    {
        public function __construct()
        {

        }

        public function insertar($nombre, $descripcion)
        {
            $sql = "INSERT INTO categoria (nombre,descripcion,condicion) 
                    VALUES ('$nombre','$descripcion','1')";
            
            return ejecutarConsulta($sql);
        }

        public function editar($idCategoria,$nombre, $descripcion)
        {
            $sql = "UPDATE categoria SET nombre='$nombre', descripcion='$descripcion'
                    WHERE idcategoria='$idCategoria'";
            
            return ejecutarConsulta($sql);
        }

        //METODOS PARA ACTIVAR CATEGORIAS
        public function desactivar($idCategoria)
        {
            $sql= "UPDATE categoria SET condicion='0' 
                   WHERE idcategoria='$idCategoria'";
            
            return ejecutarConsulta($sql);
        }

        public function activar($idCategoria)
        {
            $sql= "UPDATE categoria SET condicion='1' 
                   WHERE idcategoria='$idCategoria'";
            
            return ejecutarConsulta($sql);
        }

        //METODO PARA MOSTRAR LOS DATOS DE UN REGISTRO A MODIFICAR
        public function mostrar($idCategoria)
        {
            $sql = "SELECT * FROM categoria 
                    WHERE idcategoria='$idCategoria'";

            return ejecutarConsultaSimpleFila($sql);
        }

        //METODO PARA LISTAR LOS REGISTROS
        public function listar()
        {
            $sql = "SELECT * FROM categoria";

            return ejecutarConsulta($sql);
        }

        //METODO PARA LISTAR LOS REGISTROS Y MOSTRAR EN EL SELECT
        public function select()
        {
            $sql = "SELECT * FROM categoria 
                    WHERE condicion = 1";

            return ejecutarConsulta($sql);
        }
    }

?>