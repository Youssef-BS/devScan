export type RepoVisibility = 'public' | 'private' ;

export interface Repo {
    full_name : string ;
    name : string ;
    description : string ;
    language : string ;
    githubId : string ;
    state : RepoVisibility ;
    issues : number ;
    lastScan : string ;
    auto_audit : boolean ;
}