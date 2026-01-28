export type RepoVisibility = 'public' | 'private' ;

export interface Repo {
    id : number ;
    html_url : string ;
    fork : boolean ;
    private : boolean ;
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