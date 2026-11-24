/**
 * Escena del cuarto detrás del monitor, construida solo con CSS (sin imágenes
 * de terceros). Si existe `public/scene/bg.jpg`, se usa como capa de fondo y la
 * escena CSS se omite. Todo es decorativo y estático: el desenfoque se calcula
 * una sola vez y nada se anima.
 */
export function RoomScene({ photo }: { photo: boolean }) {
  return (
    <div className="scene" aria-hidden="true">
      {photo ? (
        <div className="scene__photo" />
      ) : (
        <>
          <div className="scene__wall" />
          <div className="scene__window-light" />
          <div className="scene__frame">
            <span className="scene__frame-art" />
          </div>
          <div className="scene__shelf">
            <span className="scene__book scene__book--1" />
            <span className="scene__book scene__book--2" />
            <span className="scene__book scene__book--3" />
            <span className="scene__book scene__book--4" />
            <span className="scene__book scene__book--5" />
            <span className="scene__plank" />
          </div>
          <div className="scene__lamp">
            <span className="scene__lamp-glow" />
            <span className="scene__lamp-shade" />
            <span className="scene__lamp-arm" />
            <span className="scene__lamp-base" />
          </div>
          <div className="scene__plant">
            <span className="scene__cactus" />
            <span className="scene__pot" />
            <span className="scene__books-stack" />
          </div>
          <div className="scene__tower">
            <span className="scene__tower-vents" />
            <span className="scene__tower-drive" />
          </div>
          <div className="scene__desk" />
          <div className="scene__desk-light" />
          <div className="scene__cup">
            <span className="scene__pencils" />
          </div>
        </>
      )}
      <div className="scene__vignette" />
      <div className="scene__grain" />
    </div>
  );
}
