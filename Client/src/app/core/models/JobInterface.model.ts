export interface JobInterface {
  id: string;
  title: string;
  img: string;
  url: string;
  company: string;
  companyUrl: string;
  city: string;
  location: string;
  date: string;
  postedDate: string;
  salaryCurrency: string;
  salaryMin: number;
  salaryMax: number;
  descriptionHtml: string;
  remoteOk: boolean;
  stackRequired: string[];
  countryCode: string;
  countryText: string;

  [key: string]: any;
}
