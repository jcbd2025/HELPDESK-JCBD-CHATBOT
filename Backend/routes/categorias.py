from flask import Blueprint, request, jsonify
from database import get_db_connection

categorias_bp = Blueprint('categorias', __name__)

@categorias_bp.route('/creacion', methods=['POST'])
def crear_categoria():
    try:
        data = request.get_json()
        nombre = data.get('nombre_categoria')
        descripcion = data.get('descripcion', '')

        if not nombre:
            return jsonify({'success': False, 'message': 'El nombre de la categoría es requerido'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO categorias (nombre_categoria, descripcion) VALUES (%s, %s)",
            (nombre, descripcion)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Categoría creada exitosamente'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/actualizacion/<int:id>', methods=['PUT'])
def actualizar_categoria(id):
    try:
        # Validar que exista el cuerpo JSON
        if not request.is_json:
            return jsonify({'success': False, 'message': 'Se esperaba JSON'}), 400
            
        data = request.get_json()
        nombre = data.get('nombre_categoria')
        descripcion = data.get('descripcion', '')

        if not nombre:
            return jsonify({'success': False, 'message': 'El nombre de la categoría es requerido'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si la categoría existe antes de actualizar
        cursor.execute("SELECT id_categoria FROM categorias WHERE id_categoria = %s", (id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Categoría no encontrada'}), 404
        
        # Actualizar la categoría
        cursor.execute(
            "UPDATE categorias SET nombre_categoria = %s, descripcion = %s WHERE id_categoria = %s",
            (nombre, descripcion, id)
        )
        conn.commit()
        
        # Devolver la categoría actualizada
        cursor.execute("SELECT * FROM categorias WHERE id_categoria = %s", (id,))
        categoria_actualizada = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Categoría actualizada exitosamente',
            'categoria': categoria_actualizada
        })
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()  # Revertir cambios en caso de error
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/eliminar/<int:id>', methods=['DELETE'])
def eliminar_categoria(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si hay tickets asociados a esta categoría
        cursor.execute("SELECT COUNT(*) FROM tickets WHERE id_categoria1 = %s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            return jsonify({'success': False, 'message': 'No se puede eliminar la categoría porque tiene tickets asociados'}), 400
            
        cursor.execute("DELETE FROM categorias WHERE id_categoria = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Categoría eliminada exitosamente'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
