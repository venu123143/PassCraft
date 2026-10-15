-- CreateTable
CREATE TABLE "passes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniquePassId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "platform" TEXT NOT NULL,
    "saveUrl" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "passes_uniquePassId_key" ON "passes"("uniquePassId");
