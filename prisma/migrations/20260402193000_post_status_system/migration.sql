UPDATE "ItemPost"
SET "status" = CASE
  WHEN "status" = 'PENDING' THEN 'CLAIM_PENDING'
  WHEN "status" = 'CLOSED' THEN 'RETURNED'
  ELSE "status"
END;
