import os
import re

import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

REQUIRED_ENV_VARS = ('DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME')
DB_CONFIG_BASE = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASS')
}
DB_NAME = os.getenv('DB_NAME')

# Datos oficiales de logística (formato directo para fácil edición por el personal)
DATOS_LOGISTICA_MEMORIA = {
    # --- HORARIOS ---
    ('horario', 'general'): 'El horario de visita al ZooMAT es de martes a domingo de 09:00 a 16:00 horas. La taquilla abre a las 09:00 horas y cierra estrictamente a las 16:00 horas. Los días lunes permanece cerrado al público por mantenimiento general.',
    ('horario', 'cierre'): 'La taquilla del ZooMAT cierra a las 16:00 horas, hora en la que concluye el acceso. Los visitantes que ya se encuentren dentro pueden continuar su recorrido, teniendo como horario máximo de salida las 18:00 horas.',
    ('horario', 'recorrido'): 'El recorrido completo por el ZooMAT dura en promedio entre dos y tres horas, dependiendo del paso de cada visitante. Se recomienda ingresar con anticipación antes del cierre de taquilla a las 16:00 horas.',
    ('horario', 'biblioteca'): 'La biblioteca del ZooMAT brinda atención al público de martes a viernes en horario diurno de 09:00 a 15:00 horas.',
    ('horario', 'tienda'): 'La tienda de regalos y recuerdos del ZooMAT abre de 09:00 a 16:00 horas de martes a domingo.',
    ('horario', 'comida'): 'Los kioscos de comida y restaurantes abren a las 09:00 horas; su hora de cierre depende de la afluencia, cerrando entre las 13:00 y las 14:00 horas en temporada baja, y entre las 16:00 y las 17:00 horas en temporada alta.',

    # --- COSTOS Y BOLETOS ---
    ('boleto', 'general'): 'La tarifa de entrada general al ZooMAT es de 35 pesos por persona. Presentando credencial vigente de estudiante, maestro, INAPAM o INSEN el costo se reduce a 25 pesos. Los niños que midan menos de un metro de estatura entran gratis, y los martes la entrada es gratuita exclusivamente para residentes de Chiapas con credencial INE de este estado.',
    ('boleto', 'adulto'): 'El costo del boleto de entrada general para adultos es de 35 pesos.',
    ('boleto', 'estudiante'): 'Los estudiantes con credencial escolar vigente pagan una tarifa preferencial de 25 pesos.',
    ('boleto', 'profesor'): 'Los maestros y docentes con credencial vigente pagan 25 pesos de entrada.',
    ('boleto', 'inapam'): 'Los adultos mayores que presenten su credencial del INAPAM o INSEN pagan una cuota preferencial de 25 pesos de entrada.',
    ('boleto', 'niño'): 'Los niños que midan menos de un metro de estatura entran totalmente gratis al ZooMAT. Los niños con estatura superior a un metro pagan 25 pesos de entrada.',
    ('boleto', 'martes'): 'Los días martes se conmemora el Martes del Pueblo y la entrada es gratuita únicamente para visitantes chiapanecos presentando su credencial del INE expedida en Chiapas. No se puede sustituir la INE por otro documento para adultos; en el caso de menores de 12 a 17 años se valida con su credencial escolar vigente.',
    ('boleto', 'credencial_desconocida'): 'Los descuentos oficiales válidos en taquilla son de 25 pesos presentando credencial escolar vigente, credencial docente o credencial de tercera edad del INAPAM o INSEN. Para cualquier otro convenio especial o credencial no contemplada, te sugerimos consultar directamente en taquilla.',
    ('boleto', 'escuelas'): 'Las escuelas públicas pueden obtener acceso gratuito al ZooMAT tramitando con anticipación una solicitud formal donde indiquen el número de alumnos, maestros y acompañantes. Las escuelas privadas no aplican para exoneración de pago, pero sus alumnos y profesores obtienen la tarifa preferencial de 25 pesos presentando su credencial escolar o docente.',
    ('boleto', 'biblioteca'): 'El acceso a la biblioteca del ZooMAT es completamente gratuito y se puede ingresar exclusivamente a ella sin pagar boleto del zoológico. Solo se requiere registrarse en la caseta de vigilancia dejando datos personales y una identificación oficial o credencial escolar.',
    ('boleto', 'foraneo'): 'Los visitantes de otros estados o del extranjero pagan la tarifa general de 35 pesos para adultos y 25 pesos presentando credencial vigente de estudiante, maestro o INAPAM, mientras que los niños menores de un metro entran gratis. Los días martes también cubren esta tarifa habitual, ya que la gratuidad del Martes del Pueblo aplica exclusivamente con credencial INE expedida en Chiapas.',

    # --- SERVICIOS Y TOURS ---
    ('servicio', 'guiado_diurno'): 'El ZooMAT ofrece recorridos guiados diurnos que se solicitan directamente en el área de taquilla. El servicio tiene un costo adicional de 20 pesos por persona sobre el valor de su boleto de entrada.',
    ('servicio', 'recorrido_nocturno'): 'Los recorridos nocturnos se realizan de martes a sábado en horarios de 19:00 y 20:00 horas y requieren previa reservación. Tienen un costo base de 1200 pesos para grupos de 1 a 12 personas, pudiendo ampliarse hasta un máximo de 15 personas pagando 100 pesos adicionales por cada persona extra.',
    ('servicio', 'biblioteca'): 'La biblioteca del ZooMAT está abierta de martes a viernes con acceso gratuito. Para acudir a ella sin entrar al zoológico, debes acudir a la caseta de vigilancia y presentar una identificación para registrar tu ingreso directo.',
    ('servicio', 'tienda'): 'La tienda de regalos y recuerdos del ZooMAT se encuentra abierta de martes a domingo de 09:00 a 16:00 horas.',
    ('servicio', 'curadores'): 'El personal técnico y curadores del zoológico se encuentran disponibles en horario de atención dependiendo de la carga de trabajo y atención de grupos. Para entrevistas especializadas o proyectos escolares se debe acudir previamente al área de difusión para gestionar el enlace.',
    ('servicio', 'aforo'): 'El ZooMAT no cuenta con un límite de cupo ni cierra taquilla por exceso de visitantes, ya que es una reserva natural abierta de gran extensión donde el público circula de manera continua.',

    # --- REGLAS Y RESTRICCIONES ---
    ('regla', 'general'): 'Para proteger a la fauna silvestre y tu seguridad en el ZooMAT, es obligatorio permanecer siempre en los andadores marcados, y está estrictamente prohibido ingresar con mascotas o bebidas alcohólicas, así como tocar o alimentar a los animales. Además, solo se permiten carriolas con llantas de goma suave y los martes aplica la campaña de cero plásticos de un solo uso y unicel.',
    ('regla', 'mascotas'): 'Está estrictamente prohibido el ingreso con mascotas bajo cualquier circunstancia, con el fin de proteger la bioseguridad, salud y bienestar de la fauna silvestre del zoológico.',
    ('regla', 'alcohol'): 'Está estrictamente prohibido ingresar con cualquier tipo de bebida alcohólica al ZooMAT; las personas que intenten introducirlas serán detenidas en el acceso.',
    ('regla', 'plasticos'): 'Los días martes se implementa la campaña oficial de Cero Plásticos de un solo uso, por lo que está prohibido ingresar envases desechables y unicel. El resto de la semana se exhorta cordialmente a los visitantes a evitar su uso para cuidar la reserva.',
    ('regla', 'carriolas'): 'Únicamente se permite el acceso de carriolas cuyas llantas sean de goma suave y no generen ruido durante el trayecto. Las carriolas con llantas rígidas de plástico están prohibidas porque el impacto continuo en el andador genera ruido excesivo que perturba a los animales.',
    ('regla', 'vestimenta'): 'No existe restricción en el tipo de ropa que puedes usar para tu visita. Sin embargo, por las características del terreno y la extensión del recorrido, se recomienda portar calzado cómodo con suela antiderrapante y ropa fresca.',
    ('regla', 'tocar_animales'): 'Está estrictamente prohibido tocar, agarrar o manipular a la fauna del ZooMAT por motivos de bioseguridad tanto para el ejemplar como para el visitante. En caso de una mordedura o incidente, se activa de inmediato el protocolo médico con vacuna antirrábica y las sanciones correspondientes.',
    ('regla', 'alimentar_animales'): 'Está estrictamente prohibido proporcionar cualquier tipo de alimento a los animales del zoológico, ya que cada especie cuenta con una dieta biológica especializada para su salud.',
    ('regla', 'andadores'): 'Es obligatorio que los visitantes permanezcan en todo momento sobre los andadores y senderos marcados. Salirse del camino oficial genera una llamada de atención inmediata, y en caso de reincidencia el visitante será retirado del parque.',
    ('regla', 'daños'): 'Dañar, grafitear o pintar las instalaciones y recintos del zoológico conlleva la detención de los responsables y la asignación obligatoria de actividades vinculadas con el cuidado del medio ambiente.',

    # --- UBICACIÓN Y TRANSPORTE ---
    ('ubicacion', 'general'): 'El ZooMAT se encuentra ubicado en Calzada Cerro Hueco s/n, Colonia Cerro Hueco, en Tuxtla Gutiérrez, Chiapas, dentro de la Reserva Natural El Zapotal.',
    ('ubicacion', 'baños'): 'El ZooMAT cuenta con cuatro módulos de sanitarios: el primero se ubica en el área de restaurantes antes de comenzar el recorrido, el segundo en plaza monos detrás del restaurante de tacos Casa Blanca, el tercero del lado derecho del hábitat de las nutrias y el cuarto a un costado izquierdo del hábitat del águila harpía.',
    ('ubicacion', 'transporte'): 'El día lunes, el acceso al transporte público y colectivos hasta la entrada principal está restringido después de las 09:00 horas para evitar aglomeraciones en los accesos peatonales. El resto de la semana el transporte público opera con normalidad hasta las 18:00 horas, hora en la que concluye el servicio.'
}


def obtener_configuracion():
    """Obtiene y valida las credenciales de MySQL desde el entorno."""
    valores_faltantes = [variable for variable in REQUIRED_ENV_VARS if not os.getenv(variable)]
    if valores_faltantes:
        raise ValueError(
            "Faltan variables de entorno para MySQL: "
            + ", ".join(valores_faltantes)
            + ". Define estas variables en el entorno o en un archivo .env."
        )

    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", DB_NAME):
        raise ValueError("DB_NAME contiene caracteres no válidos para un nombre de base de datos.")

    return DB_CONFIG_BASE, DB_NAME

def conectar_servidor():
    """Conecta al motor de MySQL sin seleccionar base de datos."""
    try:
        db_config, _ = obtener_configuracion()
        conexion = mysql.connector.connect(**db_config)
        return conexion
    except ValueError as e:
        print(f"Error de configuración: {e}")
        return None
    except Error as e:
        print(f"Error de conexión al servidor MySQL ({e}). Verifica que el contenedor esté activo, acepte conexiones y que DB_HOST, DB_USER y DB_PASS sean correctos.")
        return None

def inicializar_base_datos():
    """Crea la base de datos, la tabla e inserta los datos iniciales."""
    conexion = conectar_servidor()
    if not conexion:
        return

    cursor = None
    try:
        cursor = conexion.cursor()
        _, db_name = obtener_configuracion()

        # 1. Crear la base de datos si no existe
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Base de datos '{db_name}' verificada/creada.")
        
        # 2. Seleccionar la base de datos recién creada
        cursor.execute(f"USE {db_name}")

        # 3. Crear la tabla de logística si no existe
        tabla_sql = """
        CREATE TABLE IF NOT EXISTS servicios_logistica (
            id INT AUTO_INCREMENT PRIMARY KEY,
            entidad VARCHAR(50) NOT NULL,
            tipo_informacion VARCHAR(50) NOT NULL,
            valor TEXT NOT NULL,
            UNIQUE KEY unica_entidad_tipo (entidad, tipo_informacion)
        )
        """
        cursor.execute(tabla_sql)

        # 4. Datos oficiales para poblar la tabla
        datos_oficiales = [(ent, tip, val) for (ent, tip), val in DATOS_LOGISTICA_MEMORIA.items()]

        sql_insert = """
        INSERT INTO servicios_logistica (entidad, tipo_informacion, valor)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
        """
        cursor.executemany(sql_insert, datos_oficiales)
        conexion.commit()
        print("[EXITO] Estructura y datos de logística actualizados y listos.")

    except ValueError as e:
        print(f"Error de configuración: {e}")
    except Error as e:
        print(f"Error durante la inicialización de MySQL ({e}). Verifica el estado del contenedor y los permisos del usuario.")
    finally:
        if cursor is not None:
            cursor.close()
        conexion.close()

def obtener_catalogo_logistica():
    """
    Obtiene el catálogo completo de logística, ya sea desde MySQL
    o directamente desde el diccionario oficial en memoria.
    Retorna un diccionario de la forma {(entidad, tipo_informacion): valor_texto}.
    """
    conexion = None
    cursor = None
    try:
        db_config, db_name = obtener_configuracion()
        conexion = mysql.connector.connect(**db_config, database=db_name)
        cursor = conexion.cursor(dictionary=True)
        
        query = "SELECT entidad, tipo_informacion, valor FROM servicios_logistica"
        cursor.execute(query)
        filas = cursor.fetchall()
        catalogo = dict(DATOS_LOGISTICA_MEMORIA)
        if filas:
            catalogo.update({(fila['entidad'], fila['tipo_informacion']): fila['valor'] for fila in filas})
        return catalogo
    except (ValueError, Error, Exception):
        pass
    finally:
        if cursor is not None:
            cursor.close()
        if conexion is not None:
            conexion.close()

    # Respaldo transparente en memoria si MySQL no está activo
    return dict(DATOS_LOGISTICA_MEMORIA)

def consultar_logistica(entidad, tipo_informacion):
    """Consulta un dato específico en MySQL con respaldo transparente en memoria."""
    conexion = None
    cursor = None
    try:
        db_config, db_name = obtener_configuracion()
        conexion = mysql.connector.connect(**db_config, database=db_name)
        cursor = conexion.cursor(dictionary=True)
        
        query = "SELECT valor FROM servicios_logistica WHERE entidad = %s AND tipo_informacion = %s"
        cursor.execute(query, (entidad, tipo_informacion))
        resultado = cursor.fetchone()
        
        if resultado and resultado.get('valor'):
            return resultado['valor']
        return DATOS_LOGISTICA_MEMORIA.get((entidad, tipo_informacion))
    except (ValueError, Error, Exception):
        # Respaldo automático en memoria si MySQL no está activo o falla la conexión
        return DATOS_LOGISTICA_MEMORIA.get((entidad, tipo_informacion))
    finally:
        if cursor is not None:
            cursor.close()
        if conexion is not None:
            conexion.close()

if __name__ == "__main__":
    inicializar_base_datos()
