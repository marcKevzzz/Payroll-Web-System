export interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  department: string;
  position: string;
  hourlyRate: number;
  totalLoan: number;
  password?: string;
}
