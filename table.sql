-- Crear la tabla "productos"
CREATE TABLE productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Identificador único generado automáticamente (UUID) y clave primaria
    nombre VARCHAR(255) NOT NULL, -- Nombre del producto, obligatorio y con un límite de 255 caracteres
    imagen BYTEA -- Imagen del producto en formato binario (bytes) para almacenamiento directo en la base de datos
);

-- Crear la tabla "gramajes"
CREATE TABLE gramajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Identificador único generado automáticamente (UUID) y clave primaria
    producto_id UUID NOT NULL, -- ID del producto al que pertenece el gramaje (obligatorio)
    peso VARCHAR(50) NOT NULL, -- Peso o cantidad del producto, obligatorio (ej. "250g", "1kg")
    precio DECIMAL(10,2) NOT NULL, -- Precio del producto con hasta 10 dígitos en total y 2 decimales (ej. 99.99)
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE -- Llave foránea que relaciona con "productos.id" y elimina los gramajes si se elimina el producto
);

CREATE TABLE recetas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Identificador único para cada receta, generado automáticamente.
    nombre VARCHAR(255) NOT NULL, -- Nombre de la receta (obligatorio, máximo 255 caracteres).
    descripcion TEXT NOT NULL, -- Descripción detallada de la receta (obligatorio, sin límite de caracteres).
    url VARCHAR(500), -- Enlace opcional a un video o página con más información (máximo 500 caracteres).
    imagen TEXT -- URL de la imagen de la receta (puede ser nulo).
);
-- Modificar la tabla productos
ALTER TABLE productos
ALTER COLUMN imagen TYPE BYTEA; -- Para almacenar la imagen directamente en la base de datos
-- O mantener como TEXT si prefieres guardar la ruta