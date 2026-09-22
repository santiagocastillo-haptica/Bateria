/**
 * BlockIntroScreen.jsx — intro de cada bloque (Sección G).
 * Escena placeholder + misterio del bloque + botón continuar.
 */
import SceneVisual from "./SceneVisual.jsx";

export default function BlockIntroScreen({ bloque, numeroBloque, onContinuar }) {
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <SceneVisual numeroBloque={numeroBloque} pais={bloque.pais} escenaNombre={bloque.escena} />
        <h1>{bloque.bloque}</h1>
        {bloque.misterio && <p style={{ textAlign: "left" }}>{bloque.misterio}</p>}
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={onContinuar}>
            Comenzar este momento
          </button>
        </div>
      </div>
    </div>
  );
}
