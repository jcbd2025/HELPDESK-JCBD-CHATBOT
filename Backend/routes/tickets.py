from flask import Blueprint, request, jsonify
from database import get_db_connection

tickets_bp = Blueprint("tickets", __name__)

@tickets_bp.route("/", methods=["POST"])
@tickets_bp.route("", methods=["POST"])
def crear_ticket():
    try:
        data = request.json
        prioridad = data.get("prioridad")
        tipo = data.get("tipo", "soporte")  # valor por defecto
        titulo = data.get("titulo")
        descripcion = data.get("descripcion")
        ubicacion = data.get("ubicacion", "Sin ubicación")
        id_categoria1 = data.get("id_categoria1")
        id_grupo1 = data.get("id_grupo1")
        id_tecnico_asignado = data.get("id_tecnico_asignado")
        id_usuario_reporta = data.get("id_usuario_reporta")

        # Datos del cliente externo
        nombre = data.get("nombre")
        correo = data.get("correo")
        telefono = data.get("telefono")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insertar ticket
        cursor.execute("""
            INSERT INTO tickets (prioridad, estado_ticket, tipo, titulo, descripcion, ubicacion, 
                                 id_categoria1, id_grupo1, id_tecnico_asignado, id_usuario_reporta)
            VALUES (%s, 'nuevo', %s, %s, %s, %s, %s, %s, %s, %s)
        """, (prioridad, tipo, titulo, descripcion, ubicacion,
              id_categoria1, id_grupo1, id_tecnico_asignado, id_usuario_reporta))

        id_ticket = cursor.lastrowid

        # Insertar en cliente_externos
        if nombre and correo:
            cursor.execute("""
                INSERT INTO cliente_externos (id_ticket, nombre, correo, telefono)
                VALUES (%s, %s, %s, %s)
            """, (id_ticket, nombre, correo, telefono))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "✅ Ticket creado con éxito", "id_ticket": id_ticket}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
