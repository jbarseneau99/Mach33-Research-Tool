# -*- coding: utf-8 -*- #
# Copyright 2023 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Resource definitions for Cloud Platform Apis generated from apitools."""

import enum


BASE_URL = 'https://backupdr.googleapis.com/v1/'
DOCS_URL = 'https://cloud.google.com/backup-disaster-recovery'


class Collections(enum.Enum):
  """Collections for all supported apis."""

  PROJECTS = (
      'projects',
      'projects/{projectsId}',
      {},
      ['projectsId'],
      True
  )
  PROJECTS_LOCATIONS = (
      'projects.locations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPPLANASSOCIATIONS = (
      'projects.locations.backupPlanAssociations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/'
              'backupPlanAssociations/{backupPlanAssociationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPPLANS = (
      'projects.locations.backupPlans',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/backupPlans/'
              '{backupPlansId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPPLANS_REVISIONS = (
      'projects.locations.backupPlans.revisions',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/backupPlans/'
              '{backupPlansId}/revisions/{revisionsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPVAULTS = (
      'projects.locations.backupVaults',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/backupVaults/'
              '{backupVaultsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPVAULTS_DATASOURCES = (
      'projects.locations.backupVaults.dataSources',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/backupVaults/'
              '{backupVaultsId}/dataSources/{dataSourcesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_BACKUPVAULTS_DATASOURCES_BACKUPS = (
      'projects.locations.backupVaults.dataSources.backups',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/backupVaults/'
              '{backupVaultsId}/dataSources/{dataSourcesId}/backups/'
              '{backupsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_DATASOURCEREFERENCES = (
      'projects.locations.dataSourceReferences',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/'
              'dataSourceReferences/{dataSourceReferencesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_MANAGEMENTSERVERS = (
      'projects.locations.managementServers',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/'
              'managementServers/{managementServersId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_OPERATIONS = (
      'projects.locations.operations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/operations/'
              '{operationsId}',
      },
      ['name'],
      True
  )

  def __init__(self, collection_name, path, flat_paths, params,
               enable_uri_parsing):
    self.collection_name = collection_name
    self.path = path
    self.flat_paths = flat_paths
    self.params = params
    self.enable_uri_parsing = enable_uri_parsing
