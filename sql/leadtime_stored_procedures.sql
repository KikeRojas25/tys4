-- =============================================
-- SP 1: seguimiento.sp_LeadTimeComercial_GetByCliente
-- Retorna departamento + provincia + dias (NULL si no hay registro)
-- filtrado por cliente
-- =============================================
CREATE OR ALTER PROCEDURE seguimiento.sp_LeadTimeComercial_GetByCliente
  @idcliente INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    d.iddepartamento,
    d.departamento,
    p.idprovincia,
    p.provincia,
    lc.dias
  FROM seguimiento.departamento d
  INNER JOIN seguimiento.provincia p
    ON p.iddepartamento = d.iddepartamento
  LEFT JOIN seguimiento.LeadTimeComercial lc
    ON  lc.idprovincia = p.idprovincia
    AND lc.idcliente   = @idcliente
  ORDER BY d.departamento, p.provincia;
END;
GO

-- =============================================
-- SP 2: seguimiento.sp_LeadTimeComercial_Save
-- Recibe JSON: [{"idcliente":1,"idprovincia":5,"dias":2}, ...]
-- MERGE: UPDATE si existe (idcliente+idprovincia), INSERT si no existe
-- =============================================
CREATE OR ALTER PROCEDURE seguimiento.sp_LeadTimeComercial_Save
  @json NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @src TABLE (idcliente INT, idprovincia INT, dias INT NULL);

  INSERT INTO @src (idcliente, idprovincia, dias)
  SELECT idcliente, idprovincia, dias
  FROM OPENJSON(@json)
  WITH (
    idcliente   INT  '$.idcliente',
    idprovincia INT  '$.idprovincia',
    dias        INT  '$.dias'     -- NULL cuando se des-seleccionó
  );

  MERGE seguimiento.LeadTimeComercial AS tgt
  USING @src AS src
    ON  tgt.idcliente   = src.idcliente
    AND tgt.idprovincia = src.idprovincia
  WHEN MATCHED AND src.dias IS NULL THEN
    DELETE                                      -- des-seleccionado → borrar registro
  WHEN MATCHED AND src.dias IS NOT NULL THEN
    UPDATE SET
      dias              = src.dias,
      fechamodificacion = GETDATE()
  WHEN NOT MATCHED BY TARGET AND src.dias IS NOT NULL THEN
    INSERT (idcliente, idprovincia, dias, fechamodificacion)
    VALUES (src.idcliente, src.idprovincia, src.dias, GETDATE());

  SELECT @@ROWCOUNT AS afectados;
END;
GO

-- =============================================
-- SP 3: seguimiento.sp_LeadTimeOperativo_Get
-- Retorna todas las provincias con su dia operativo (NULL si no hay registro)
-- =============================================
CREATE OR ALTER PROCEDURE seguimiento.sp_LeadTimeOperativo_Get
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    d.iddepartamento,
    d.departamento,
    p.idprovincia,
    p.provincia,
    lo.dias
  FROM seguimiento.departamento d
  INNER JOIN seguimiento.provincia p
    ON p.iddepartamento = d.iddepartamento
  LEFT JOIN seguimiento.LeadTimeOperativo lo
    ON lo.idprovincia = p.idprovincia
  ORDER BY d.departamento, p.provincia;
END;
GO

-- =============================================
-- SP 4: seguimiento.sp_LeadTimeOperativo_Save
-- Recibe JSON: [{"idprovincia":5,"dias":3}, ...]
-- MERGE: UPDATE si existe, INSERT si no existe
-- =============================================
CREATE OR ALTER PROCEDURE seguimiento.sp_LeadTimeOperativo_Save
  @json NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @src TABLE (idprovincia INT, dias INT NULL);

  INSERT INTO @src (idprovincia, dias)
  SELECT idprovincia, dias
  FROM OPENJSON(@json)
  WITH (
    idprovincia INT '$.idprovincia',
    dias        INT '$.dias'     -- NULL cuando se des-seleccionó
  );

  MERGE seguimiento.LeadTimeOperativo AS tgt
  USING @src AS src
    ON tgt.idprovincia = src.idprovincia
  WHEN MATCHED AND src.dias IS NULL THEN
    DELETE                                      -- des-seleccionado → borrar registro
  WHEN MATCHED AND src.dias IS NOT NULL THEN
    UPDATE SET
      dias              = src.dias,
      fechamodificacion = GETDATE()
  WHEN NOT MATCHED BY TARGET AND src.dias IS NOT NULL THEN
    INSERT (idprovincia, dias, fechamodificacion)
    VALUES (src.idprovincia, src.dias, GETDATE());

  SELECT @@ROWCOUNT AS afectados;
END;
GO
