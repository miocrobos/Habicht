-- Convert genderCoached from Gender to Gender[]
ALTER TABLE "Recruiter" ALTER COLUMN "genderCoached" TYPE "Gender"[] USING CASE WHEN "genderCoached" IS NULL THEN ARRAY[]::"Gender"[] ELSE ARRAY["genderCoached"]::"Gender"[] END;
ALTER TABLE "Recruiter" ALTER COLUMN "genderCoached" SET DEFAULT ARRAY[]::"Gender"[];