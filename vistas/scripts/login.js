$("#frmAcceso").on('submit',function(e){
    e.preventDefault();
    logina = $("#logina").val();
    clavea = $("#clavea").val();

    $.post("../ajax/usuario.php?op=verificar",
        {
            logina:logina,
            clavea:clavea
        },
        function(data)
        {
            if(data != 'null')
            {
                $(location).attr("href","escritorio.php");
            }
            else
            {
                bootbox.alert("Usuario o contraseña incorrecta");
            }
        }
    );
})