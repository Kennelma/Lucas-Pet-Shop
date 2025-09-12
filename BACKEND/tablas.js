//OBJETO DE TABLAS

const Veterinaria = {

    empresas: {
        tabla: 'tbl_empresa',
        campos: ['nombre_empresa', 'direccion_empresa', 'contacto_empresa']
    },
    roles: {
        tabla: 'tbl_roles',
        campos: ['tipo_rol']
    },
    usuarios: {
        tabla: 'tbl_usuario',
        campos: ['usuario', 'email_usuario', 'clave_usuario', 'estado_usuario', 'id_rol_fk', 'id_empresa_fk']
    },
    clientes: {
        tabla: 'tbl_clientes',
        campos: ['nombre_cliente', 'identidad_cliente', 'telefono_cliente']
    },
    recordatorios: {
        tabla: 'tbl_recordatorios',
        campos: ['mensaje_recordatorio', 'frecuencia_recordatorio', 'fecha_recordatorio', 'id_cliente_fk']
    },
    estilistas_caninos: {
        tabla: 'tbl_estilistas_caninos',
        campos: ['nombre_estilista']
    },
    facturas: {
        tabla: 'tbl_facturas',
        campos: ['numero_factura', 'RTN', 'impuesto', 'id_cliente_fk', 'id_usuario_fk']
    },
    categoria_items: {
        tabla: 'tbl_categoria_item',
        campos: ['categoria_item']
    },
    detalles_facturas: {
        tabla: 'tbl_detalles_facturas',
        campos: ['cantidad_item', 'precio_unitario_item', 'subtotal', 'ajuste_precio', 'total', 'id_factura_fk', 'id_categoria_item_fk', 'id_estilista_fk']
    },
    promociones: {
        tabla: 'tbl_promociones',
        campos: ['nombre_promocion', 'descripcion_promocion', 'precio_promocion', 'dias_promocion', 'id_categoria_item_fk']
    },
    servicios_peluqueria_canina: {
        tabla: 'tbl_servicios_peluqueria_canina',
        campos: ['nombre_servicio_peluqueria', 'descripcion_servicio', 'id_categoria_item_fk']
    },
    tarifa_servicio_peluqueria: {
        tabla: 'tbl_tarifa_servicio_peluqueria',
        campos: ['raza', 'tamanio', 'precio_servicio', 'id_servicio_peluqueria_fk']
    },
    productos: {
        tabla: 'tbl_productos',
        campos: ['nombre_producto', 'precio_unitario_producto', 'cantidad_en_stock', 'id_categoria_item_fk']
    },
    alimentos: {
        tabla: 'tbl_alimentos',
        campos: ['alimento_destinado', 'peso_alimento', 'id_producto_fk']
    },
    animales: {
        tabla: 'tbl_animales',
        campos: ['sexo', 'especie', 'id_producto_fk']
    },
    accesorios: {
        tabla: 'tbl_accesorios',
        campos: ['tipo_accesorio', 'id_producto_fk']
    },
    medicamentos: {
        tabla: 'tbl_medicamentos',
        campos: ['presentacion_medica', 'tipo_medicamento', 'id_producto_fk']
    },
    lotes_medicamentos: {
        tabla: 'tbl_lotes_medicamentos',
        campos: ['codigo_lote', 'fecha_ingreso', 'fecha_vencimiento', 'cantidad_entrada', 'cantidad_disponible', 'id_medicamento_fk']
    },
    notificaciones: {
        tabla: 'tbl_notificaciones',
        campos: ['nombre_notificacion', 'descripcion_notificacion', 'fecha_notificacion', 'id_producto_fk', 'id_lotes_medicamentos_fk']
    },
    pagos: {
        tabla: 'tbl_pagos',
        campos: ['monto_pagado', 'metodo_pago', 'tipo_pago', 'id_factura_fk']
    },
    gastos: {
        tabla: 'tbl_gastos',
        campos: ['detalle_gasto', 'monto_gasto', 'fecha_registro_gasto', 'id_usuario_fk']
    },
    bonificaciones: {
        tabla: 'tbl_bonificaciones',
        campos: ['numero_mascotas_atendidas', 'fecha_bonificacion', 'id_estilista_fk']
    },
    historial_bonificaciones: {
        tabla: 'tbl_historial_bonificaciones',
        campos: ['fecha_bonificacion']
    },
    historial_ventas: {
        tabla: 'tbl_historial_ventas',
        campos: ['fecha_venta', 'total_facturas', 'total_ingreso', 'total_gastos']
    },
    historial_medicamentos_vendidos: {
        tabla: 'tbl_historial_medicamentos_vendidos',
        campos: ['fecha_historial_medicamentos', 'total_ingreso_medicamentos']
    }
};


module.exports = Veterinaria;