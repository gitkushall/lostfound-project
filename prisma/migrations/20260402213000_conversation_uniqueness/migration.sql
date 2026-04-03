DELETE FROM "Conversation" a
USING "Conversation" b
WHERE a.id > b.id
  AND a."itemId" = b."itemId"
  AND a."user1Id" = b."user1Id"
  AND a."user2Id" = b."user2Id";

CREATE UNIQUE INDEX "Conversation_itemId_user1Id_user2Id_key"
ON "Conversation"("itemId", "user1Id", "user2Id");
