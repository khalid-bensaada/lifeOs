export const CODES = {
  "Route not found": "notFound",
  "Invalid id": "invalidId",
  "Invalid date": "invalidDate",
  "Invalid level": "invalidLevel",
  "Week must start on a Monday": "weekMonday",
  "Nothing to update": "nothingToUpdate",

  "This email is already registered": "emailTaken",
  "Invalid email or password": "invalidCredentials",
  "Please log in to continue": "loginRequired",
  "Your session has expired. Please log in again.": "sessionExpired",
  "Please enter a valid email address": "invalidEmail",
  "Name must be at least 2 characters": "nameShort",
  "Password must be at least 8 characters": "passwordShort",
  "Password is too long": "passwordLong",
  "Password is required": "passwordRequired",

  "Title is required": "titleRequired",
  "Title is too long": "titleLong",
  "Description is too long": "descriptionLong",
  "Deadline must be a valid date": "deadlineInvalid",
  "Due date must be a valid date": "dueInvalid",
  "Date must be valid": "dateInvalid",
  "Time must be valid": "timeInvalid",

  "Duration must be a whole number": "durationWhole",
  "Duration must be at least 1 minute": "durationMin",
  "Duration is too short": "durationShort",
  "Duration is too long": "durationLong",

  "Name is required": "nameRequired",
  "Name is too long": "nameLong",
  "Category is required": "categoryRequired",
  "Category is too long": "categoryLong",
  "Technology is too long": "techLong",

  "Note is too long": "noteLong",
  "Note cannot be empty": "noteEmpty",
  "Answer is too long": "answerLong",
  "Priority cannot be empty": "priorityEmpty",
  "Priority is too long": "priorityLong",
  "Choose at most 5 priorities": "prioritiesMax",
  "Text is too long": "textLong",

  "End time must be after start time": "endAfterStart",
  "Limit must be a whole number": "limitWhole",
  "Limit must be at least 1": "limitMin",
  "Limit cannot be more than 10": "limitMax",
  "Working hours must end after they start": "workHours",

  "Goal not found": "goalNotFound",
  "Milestone not found": "milestoneNotFound",
  "Task not found": "taskNotFound",
  "Project not found": "projectNotFound",
  "Habit not found": "habitNotFound",
  "Time entry not found": "timeNotFound",
  "Event not found": "eventNotFound",
  "Skill not found": "skillNotFound",
  "Practice project not found": "practiceNotFound",
  "Note not found": "noteNotFound",
  "The selected item was not found": "itemNotFound",
};

export const ALL_CODES = [
  ...new Set([
    ...Object.values(CODES),
    "generic",
    "invalidInput",
    "taskLimit",
    "tooManyRequests",
    "tooLarge",
  ]),
];

export const codeOf = (message) => CODES[message];
